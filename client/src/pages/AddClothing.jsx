import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Check,
  ImagePlus,
  Sparkles,
  Upload,
  X,
  RotateCcw,
} from "lucide-react";

import api from "../services/api";

const categories = [
  "Tops",
  "Jeans",
  "Dresses",
  "Shoes",
  "Accessories",
];

const occasions = [
  "Casual",
  "College",
  "Party",
  "Formal",
];

export default function AddClothing() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    category: "Tops",
    color: "",
    occasion: "Casual",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // -----------------------------
  // FORM CHANGE
  // -----------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // -----------------------------
  // GALLERY
  // -----------------------------

  const openGallery = () => {
    if (loading) return;

    if (!fileInputRef.current) return;

    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    if (!file.type.startsWith("image/")) {
      setError(
        "Please choose a valid image file."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        "Image size should be less than 10MB."
      );
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl =
      URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(previewUrl);
  };

  // -----------------------------
  // CAMERA
  // -----------------------------

  const startCamera = async () => {
    if (loading) return;

    try {
      setError("");
      setSuccess("");
      setCameraReady(false);

      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          "Camera is not supported by this browser. Please choose a photo from your gallery."
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
            },
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
          audio: false,
        });

      setCameraStream(stream);
      setCameraOpen(true);

      // Attach stream after modal renders.
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current
            .play()
            .catch(() => {});
        }
      });
    } catch (error) {
      console.error(
        "Camera permission error:",
        error
      );

      if (
        error?.name ===
        "NotAllowedError"
      ) {
        setError(
          "Camera permission was denied. Please allow camera access in your browser settings."
        );
      } else if (
        error?.name ===
        "NotFoundError"
      ) {
        setError(
          "No camera was found on this device."
        );
      } else {
        setError(
          "Unable to open the camera. Please allow camera access or choose a photo from your gallery."
        );
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream
        .getTracks()
        .forEach((track) => {
          track.stop();
        });
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraStream(null);
    setCameraOpen(false);
    setCameraReady(false);
  };

  const handleVideoReady = () => {
    setCameraReady(true);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setError(
        "Camera is not ready."
      );
      return;
    }

    const width =
      video.videoWidth;

    const height =
      video.videoHeight;

    if (!width || !height) {
      setError(
        "Camera is still loading. Please wait a moment and try again."
      );
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const context =
      canvas.getContext("2d");

    if (!context) {
      setError(
        "Unable to capture the photo."
      );
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      width,
      height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError(
            "Unable to capture photo."
          );
          return;
        }

        const file = new File(
          [blob],
          `clothing-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        if (imagePreview) {
          URL.revokeObjectURL(
            imagePreview
          );
        }

        const previewUrl =
          URL.createObjectURL(file);

        setImageFile(file);
        setImagePreview(previewUrl);

        setError("");
        setSuccess(
          "Photo captured successfully."
        );

        stopCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  // -----------------------------
  // REMOVE PHOTO
  // -----------------------------

  const removePhoto = () => {
    if (imagePreview) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setImageFile(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setError("");
    setSuccess("");
  };

  // -----------------------------
  // SUBMIT
  // -----------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError(
        "Please enter the clothing name."
      );
      return;
    }

    if (!form.color.trim()) {
      setError(
        "Please enter the clothing color."
      );
      return;
    }

    if (!imageFile) {
      setError(
        "Please choose a photo from your gallery or take a photo using the camera."
      );
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "category",
        form.category
      );

      formData.append(
        "color",
        form.color.trim()
      );

      formData.append(
        "occasion",
        form.occasion
      );

      formData.append(
        "image",
        imageFile
      );

      const response =
        await api.postForm(
          "/clothing",
          formData
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to add clothing."
        );
      }

      setSuccess(
        "Clothing added successfully to your closet."
      );

      setTimeout(() => {
        navigate("/closet");
      }, 800);
    } catch (error) {
      console.error(
        "Add clothing error:",
        error
      );

      setError(
        error?.message ||
          "Unable to upload clothing. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // CLEANUP
  // -----------------------------

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream
          .getTracks()
          .forEach((track) => {
            track.stop();
          });
      }

      if (imagePreview) {
        URL.revokeObjectURL(
          imagePreview
        );
      }
    };
  }, [cameraStream, imagePreview]);

  return (
    <div className="add-clothing-page">

      {/* TOPBAR */}
      <header className="add-clothing-topbar">

        <Link
          to="/dashboard"
          className="add-clothing-brand"
        >
          <span className="brand-icon">
            <Sparkles size={16} />
          </span>

          <span>ClosetIQ</span>
        </Link>

        <Link
          to="/closet"
          className="add-clothing-back"
        >
          <ArrowLeft size={16} />
          Back to closet
        </Link>

      </header>

      {/* MAIN */}
      <main className="add-clothing-main">

        {/* HERO */}
        <section className="add-clothing-hero">

          <p className="add-clothing-eyebrow">
            DIGITAL WARDROBE
          </p>

          <h1 className="add-clothing-title">
            Add something
            <span> you love.</span>
          </h1>

          <p className="add-clothing-subtitle">
            Upload a photo or take one with your
            camera. ClosetIQ will keep it in your
            digital wardrobe for future outfit ideas.
          </p>

        </section>

        {/* ERROR */}
        {error && (
          <div className="add-error">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="add-success">
            <Check size={17} />
            {success}
          </div>
        )}

        <div className="add-clothing-grid">

          {/* PHOTO CARD */}
          <section className="photo-card">

            <div className="section-title-row">

              <div>
                <h2>
                  Clothing photo
                </h2>

                <p>
                  Add a clear photo of your item.
                </p>
              </div>

              <div className="section-icon">
                <ImagePlus size={18} />
              </div>

            </div>

            {/* Hidden Gallery Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/*"
              onChange={handleFileChange}
              style={{
                display: "none",
              }}
            />

            {/* IMAGE */}
            {imagePreview ? (
              <div className="photo-preview">

                <img
                  src={imagePreview}
                  alt="Selected clothing"
                />

                <button
                  type="button"
                  className="remove-photo-button"
                  onClick={removePhoto}
                  disabled={loading}
                >
                  <X size={18} />
                </button>

              </div>
            ) : (
              <div className="photo-empty">

                <div className="upload-icon">
                  <ImagePlus size={28} />
                </div>

                <h3>
                  Add your clothing photo
                </h3>

                <p>
                  Choose a photo from your gallery
                  or take a new one.
                </p>

              </div>
            )}

            {/* PHOTO BUTTONS */}
            <div className="photo-actions">

              <button
                type="button"
                className="camera-button"
                onClick={startCamera}
                disabled={loading}
              >
                <Camera size={18} />
                Take Photo
              </button>

              <button
                type="button"
                className="upload-button"
                onClick={openGallery}
                disabled={loading}
              >
                <ImagePlus size={18} />
                Choose from Gallery
              </button>

            </div>

            <p className="photo-note">
              JPG, PNG or WebP · Maximum 10MB
            </p>

          </section>

          {/* DETAILS */}
          <section className="details-card">

            <div className="section-title-row">

              <div>
                <h2>
                  Clothing details
                </h2>

                <p>
                  Tell ClosetIQ about this piece.
                </p>
              </div>

              <div className="section-icon">
                <Sparkles size={18} />
              </div>

            </div>

            <form
              onSubmit={handleSubmit}
              className="clothing-form"
            >

              {/* NAME */}
              <div className="input-group">

                <label htmlFor="name">
                  Clothing name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. White oversized shirt"
                  value={form.name}
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>

              {/* CATEGORY */}
              <div className="input-group">

                <label>
                  Category
                </label>

                <div className="category-grid">

                  {categories.map(
                    (category) => (
                      <button
                        key={category}
                        type="button"
                        className={
                          form.category ===
                          category
                            ? "category-option active"
                            : "category-option"
                        }
                        onClick={() => {
                          setForm(
                            (previous) => ({
                              ...previous,
                              category,
                            })
                          );

                          setError("");
                        }}
                        disabled={loading}
                      >
                        {category}
                      </button>
                    )
                  )}

                </div>

              </div>

              {/* COLOR */}
              <div className="input-group">

                <label htmlFor="color">
                  Color
                </label>

                <input
                  id="color"
                  name="color"
                  type="text"
                  placeholder="e.g. White, Black, Pink"
                  value={form.color}
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>

              {/* OCCASION */}
              <div className="input-group">

                <label>
                  Best for
                </label>

                <div className="occasion-grid">

                  {occasions.map(
                    (occasion) => (
                      <button
                        key={occasion}
                        type="button"
                        className={
                          form.occasion ===
                          occasion
                            ? "occasion-option active"
                            : "occasion-option"
                        }
                        onClick={() => {
                          setForm(
                            (previous) => ({
                              ...previous,
                              occasion,
                            })
                          );

                          setError("");
                        }}
                        disabled={loading}
                      >
                        {occasion}
                      </button>
                    )
                  )}

                </div>

              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                className="submit-clothing-button"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    Adding to your closet...
                  </>
                ) : (
                  <>
                    Add to My Closet
                    <ArrowLeft
                      size={18}
                      style={{
                        transform:
                          "rotate(180deg)",
                      }}
                    />
                  </>
                )}

              </button>

            </form>

          </section>

        </div>

      </main>

      {/* CAMERA MODAL */}
      {cameraOpen && (
        <div className="camera-overlay">

          <div className="camera-modal">

            <div className="camera-header">

              <div>
                <p className="camera-eyebrow">
                  CLOSETIQ CAMERA
                </p>

                <h2>
                  Take a photo
                </h2>

                <p>
                  Position your clothing inside
                  the frame.
                </p>
              </div>

              <button
                type="button"
                className="camera-close"
                onClick={stopCamera}
              >
                <X size={20} />
              </button>

            </div>

            {/* VIDEO */}
            <div className="camera-view">

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={
                  handleVideoReady
                }
              />

              <div className="camera-frame">
                <span></span>
              </div>

              {!cameraReady && (
                <div className="camera-loading">
                  <div className="button-spinner"></div>
                  <span>
                    Starting camera...
                  </span>
                </div>
              )}

            </div>

            <canvas
              ref={canvasRef}
              style={{
                display: "none",
              }}
            />

            {/* CAMERA ACTIONS */}
            <div className="camera-actions">

              <button
                type="button"
                className="secondary-photo-button"
                onClick={stopCamera}
              >
                Cancel
              </button>

              <button
                type="button"
                className="capture-button"
                onClick={capturePhoto}
                disabled={!cameraReady}
              >
                <Camera size={19} />
                Capture Photo
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}