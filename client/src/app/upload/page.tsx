"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { UploadCloud, CheckCircle, AlertCircle, X, Image as ImageIcon } from "lucide-react";

export default function UploadPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    condition: "",
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [status, setStatus] = useState<"idle" | "creating" | "uploading" | "verifying" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setErrorMessage("Please select an image");
      setStatus("error");
      return;
    }

    try {
      setStatus("creating");
      setErrorMessage("");

      // 1. Create Product
      const productRes = await api.post("/products", {
        ...formData,
        price: parseFloat(formData.price),
      });
      const productId = productRes.data.data.id;

      // 2. Upload Image & Trigger Verification
      setStatus("uploading");
      const imageFormData = new FormData();
      imageFormData.append("image", imageFile);

      setStatus("verifying");
      const uploadRes = await api.post(`/products/${productId}/image`, imageFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(uploadRes.data.data.verification);
      setStatus("success");

    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.response?.data?.message || "Failed to upload and verify product");
      setStatus("error");
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Upload New Listing</h1>
        <p className="text-slate-500 mt-2">Add a product and our AI Verification Engine will review it instantly.</p>
      </div>

      <div className="glass-card rounded-2xl p-8">
        {status === "success" && result ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in slide-in-from-bottom-4">
            {result.overallStatus === "PASSED" ? (
              <div className="w-20 h-20 bg-secondary/20 text-secondary rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10" />
              </div>
            )}
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Verification {result.overallStatus}
            </h2>
            
            <div className="text-slate-600 mb-8 max-w-md mx-auto">
              {result.overallStatus === "PASSED" ? (
                <p>Your listing looks great! The AI engine approved it with {Math.round(result.confidence * 100)}% confidence.</p>
              ) : (
                <div className="text-left bg-red-50 p-4 rounded-xl border border-red-100 mt-4">
                  <p className="font-semibold text-red-800 mb-2">Issues detected:</p>
                  <ul className="list-disc pl-5 space-y-1 text-red-700 text-sm">
                    {result.reasons.map((reason: string, idx: number) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button 
                onClick={() => router.push("/dashboard")}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full font-medium transition-colors"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={() => {
                  setStatus("idle");
                  setFormData({ title: "", description: "", category: "", price: "", condition: "" });
                  removeImage();
                  setResult(null);
                }}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-full font-medium transition-colors shadow-md"
              >
                Upload Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">Product Image</label>
              
              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 h-64 flex items-center justify-center group">
                  <img src={imagePreview} alt="Preview" className="h-full object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={removeImage}
                      className="bg-white/20 hover:bg-red-500 hover:text-white backdrop-blur-md p-3 rounded-full text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 group-hover:text-primary group-hover:bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <p className="text-slate-700 font-medium text-lg">Click or drag image to upload</p>
                  <p className="text-slate-500 text-sm mt-1">JPEG, PNG, WEBP (Max 5MB)</p>
                </div>
              )}
            </div>

            {/* Product Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Listing Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Vintage Leather Jacket"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Describe the item, flaws, size, etc."
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-shadow resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                >
                  <option value="">Select category...</option>
                  <option value="Tops">Tops</option>
                  <option value="Bottoms">Bottoms</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                >
                  <option value="">Select condition...</option>
                  <option value="New with tags">New with tags</option>
                  <option value="Like new">Like new</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                />
              </div>
            </div>

            {status === "error" && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status !== "idle" && status !== "error"}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium shadow-md shadow-primary/20 transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {(status === "creating" || status === "uploading" || status === "verifying") ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {status === "creating" && "Saving details..."}
                  {status === "uploading" && "Uploading image..."}
                  {status === "verifying" && "AI Engine Verifying..."}
                </>
              ) : (
                "Submit Listing"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
