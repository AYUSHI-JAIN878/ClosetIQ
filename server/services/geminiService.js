import ai from "../config/gemini.js";

/* =========================================
   GEMINI MODELS
========================================= */

const MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash-lite",
];

/* =========================================
   CLOUDINARY IMAGE → GEMINI IMAGE PART
========================================= */

const getImagePart = async (imageUrl) => {
  if (!imageUrl) return null;

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      console.error(
        `Failed to fetch Cloudinary image: ${response.status}`
      );

      return null;
    }

    const arrayBuffer =
      await response.arrayBuffer();

    const base64Data =
      Buffer.from(arrayBuffer).toString(
        "base64"
      );

    const mimeType =
      response.headers.get(
        "content-type"
      ) || "image/jpeg";

    return {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };
  } catch (error) {
    console.error(
      "Cloudinary image conversion error:",
      error?.message || error
    );

    return null;
  }
};

/* =========================================
   CHECK TEMPORARY GEMINI ERROR
========================================= */

const isTemporaryGeminiError = (error) => {
  const message =
    error?.message || "";

  return (
    message.includes("503") ||
    message.includes("UNAVAILABLE") ||
    message.includes("high demand") ||
    message.includes("temporarily") ||
    message.includes("overloaded") ||
    message.includes("RESOURCE_EXHAUSTED")
  );
};

/* =========================================
   GEMINI API RESPONSE
   PRIMARY + FALLBACK MODEL
========================================= */

const generateAIResponse = async (
  contents
) => {
  let lastError = null;

  for (const model of MODELS) {
    try {
      console.log(
        `Sending request to Gemini (${model})...`
      );

      const response =
        await ai.models.generateContent({
          model,
          contents,
        });

      console.log(
        `Gemini response received from ${model}.`
      );

      if (!response?.text) {
        throw new Error(
          "Gemini returned an empty response."
        );
      }

      return response.text;
    } catch (error) {
      lastError = error;

      console.error(
        `Gemini ${model} error:`,
        error?.message || error
      );

      const temporaryError =
        isTemporaryGeminiError(error);

      /*
        If this is not a temporary/
        availability error, don't try
        another model unnecessarily.
      */

      if (!temporaryError) {
        throw new Error(
          error?.message ||
            "AI service is currently unavailable."
        );
      }

      /*
        Try the next model.
      */

      console.log(
        `${model} is currently unavailable. Trying fallback model...`
      );
    }
  }

  /*
    All available models failed.
  */

  if (
    lastError &&
    isTemporaryGeminiError(lastError)
  ) {
    throw new Error(
      "Gemini AI is temporarily unavailable. Please try again in a little while."
    );
  }

  throw new Error(
    lastError?.message ||
      "AI service is currently unavailable."
  );
};

/* =========================================
   CREATE WARDROBE TEXT
========================================= */

const createWardrobeText = (
  clothing = []
) => {
  if (
    !Array.isArray(clothing) ||
    clothing.length === 0
  ) {
    return "No wardrobe items available.";
  }

  return clothing
    .map(
      (item, index) => `
WARDROBE ITEM ${index + 1}
ID: ${item._id}
Name: ${item.name}
Category: ${item.category}
Color: ${item.color || "Not provided"}
Occasion: ${item.occasion || "Not provided"}
`
    )
    .join("\n");
};

/* =========================================
   AI OUTFIT SUGGESTION
   TEXT + ACTUAL CLOTHING IMAGES
========================================= */

export const suggestOutfit = async ({
  clothing,
  occasion,
  weather,
}) => {
  const wardrobe =
    createWardrobeText(clothing);

  const imageParts = [];

  /*
    Send actual Cloudinary clothing
    images for visual analysis.
  */

  for (const item of clothing || []) {
    if (!item.imageUrl) continue;

    const imagePart =
      await getImagePart(
        item.imageUrl
      );

    if (imagePart) {
      imageParts.push(imagePart);
    }
  }

  const prompt = `
You are ClosetIQ, a personal AI wardrobe stylist.

Analyze the user's REAL wardrobe.

WARDROBE:
${wardrobe}

OCCASION:
${occasion || "Casual"}

WEATHER:
${weather || "Not provided"}

IMPORTANT RULES:

1. ONLY recommend items that exist in the provided wardrobe.
2. NEVER invent clothing items.
3. Use the wardrobe information and provided images.
4. Consider colors, patterns and visual compatibility.
5. Consider the occasion.
6. Consider the weather.
7. Create ONE practical complete outfit.
8. Use exact wardrobe item IDs and names.
9. Do not return items that are not present in the wardrobe.

Return ONLY valid JSON.

{
  "title": "short outfit title",
  "items": [
    {
      "id": "exact wardrobe item ID",
      "name": "exact wardrobe item name",
      "category": "exact category"
    }
  ],
  "reason": "short explanation based on the user's wardrobe"
}
`;

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: prompt,
        },
        ...imageParts,
      ],
    },
  ];

  return generateAIResponse(
    contents
  );
};

/* =========================================
   STYLE SELECTED CLOTHING
   FAST TEXT-BASED VERSION
========================================= */

export const styleClothing = async ({
  clothing,
  selectedItem,
  occasion,
  weather,
}) => {
  if (!selectedItem) {
    throw new Error(
      "No clothing item was selected."
    );
  }

  const wardrobe =
    createWardrobeText(clothing);

  /*
    IMPORTANT:

    We intentionally do NOT download
    Cloudinary images for this request.

    This makes "Style This Outfit"
    much faster and reduces request size.
  */

  const prompt = `
You are ClosetIQ, an AI personal wardrobe stylist.

The user selected this clothing item:

ID: ${selectedItem._id}
Name: ${selectedItem.name}
Category: ${selectedItem.category}
Color: ${selectedItem.color || "Not provided"}
Occasion: ${selectedItem.occasion || "Not provided"}

USER'S WARDROBE:
${wardrobe}

OCCASION:
${occasion || "Casual"}

WEATHER:
${weather || "Not provided"}

Your task is to suggest compatible clothing items
from the user's REAL wardrobe to style the selected item.

IMPORTANT RULES:

1. ONLY use items from the provided wardrobe.
2. NEVER invent clothing items.
3. DO NOT repeat the selected item.
4. Use exact wardrobe IDs.
5. Use exact wardrobe names.
6. Consider category compatibility.
7. Consider color compatibility.
8. Consider the occasion.
9. Consider the weather.
10. Suggest 2 to 4 compatible items.
11. If fewer suitable items exist, suggest only those items.
12. Keep the outfit practical and wearable.

Return ONLY valid JSON.

{
  "selectedItem": {
    "id": "${selectedItem._id}",
    "name": "${selectedItem.name}"
  },
  "suggestions": [
    {
      "id": "exact wardrobe item ID",
      "name": "exact wardrobe item name",
      "category": "exact category"
    }
  ],
  "reason": "short explanation based on the user's wardrobe"
}
`;

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: prompt,
        },
      ],
    },
  ];

  return generateAIResponse(
    contents
  );
};

/* =========================================
   AI PACKING PLAN
========================================= */

export const createPackingPlan = async ({
  clothing,
  destination,
  days,
  occasion,
}) => {
  const wardrobe =
    createWardrobeText(clothing);

  const prompt = `
You are ClosetIQ, an AI packing assistant.

USER'S WARDROBE:
${wardrobe}

DESTINATION:
${destination || "Not provided"}

NUMBER OF DAYS:
${days || "Not provided"}

OCCASION:
${occasion || "Mixed"}

Create a practical packing plan using ONLY
the user's existing wardrobe.

IMPORTANT RULES:

1. ONLY use items from the provided wardrobe.
2. NEVER invent clothing items.
3. Consider the destination.
4. Consider the number of days.
5. Consider the occasion.
6. Avoid unnecessary duplicates.
7. Use exact wardrobe IDs and names.
8. Keep the packing plan practical.

Return ONLY valid JSON.

{
  "title": "short packing plan title",
  "items": [
    {
      "id": "exact wardrobe item ID",
      "name": "exact wardrobe item name",
      "category": "exact category",
      "quantity": 1
    }
  ],
  "reason": "short explanation"
}
`;

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: prompt,
        },
      ],
    },
  ];

  return generateAIResponse(
    contents
  );
};