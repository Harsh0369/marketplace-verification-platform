"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Shield, ShieldAlert, Image as ImageIcon, Search, Filter, Loader2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data.data.rows);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Moderation Dashboard</h1>
          <p className="text-slate-500 mt-2">View and manage AI verification results for all listings.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search listings..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm shadow-sm hover:bg-slate-50 transition-colors text-slate-700 font-medium">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading listings...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-6">
            <ImageIcon className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No listings found</h2>
          <p className="text-slate-500 mb-6 max-w-md">You haven't uploaded any products yet. Go to the upload page to add your first listing.</p>
          <button 
            onClick={() => router.push("/upload")}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-full font-medium shadow-md shadow-primary/20 transition-all hover:shadow-lg"
          >
            Upload Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {products.map((product) => {
            const result = product.verificationResult;
            const hasPassed = result?.overallStatus === "PASSED";
            const hasFailed = result?.overallStatus === "FAILED";
            const isExpanded = expandedId === product.id;
            const primaryImage = product.images?.[0]?.imageUrl;

            return (
              <div 
                key={product.id} 
                className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
                  isExpanded ? "ring-2 ring-primary/20 shadow-lg" : "hover:shadow-md hover:border-slate-300"
                }`}
              >
                <div 
                  className="flex flex-col md:flex-row p-5 cursor-pointer items-start md:items-center gap-6"
                  onClick={() => setExpandedId(isExpanded ? null : product.id)}
                >
                  {/* Thumbnail */}
                  <div className="w-full md:w-32 h-32 md:h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                    {primaryImage ? (
                      <img src={primaryImage} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    
                    {/* Status Badge overlay on mobile */}
                    <div className="absolute top-2 right-2 md:hidden">
                      {hasPassed && (
                        <div className="bg-secondary text-white p-1.5 rounded-full shadow-sm">
                          <Shield className="w-4 h-4" />
                        </div>
                      )}
                      {hasFailed && (
                        <div className="bg-red-500 text-white p-1.5 rounded-full shadow-sm">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-slate-900 truncate">{product.title}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                        {product.category}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm truncate mb-3">{product.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold text-slate-700">₹{product.price}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600">{product.condition}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 text-xs">{new Date(product.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Status Desktop */}
                  <div className="hidden md:flex flex-col items-end shrink-0 min-w-[140px]">
                    {result ? (
                      <>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-sm border ${
                          hasPassed ? "bg-secondary/10 text-secondary border-secondary/20" : 
                          hasFailed ? "bg-red-50 text-red-600 border-red-100" : 
                          "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                          {hasPassed ? <Shield className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                          {result.overallStatus}
                        </div>
                        <span className="text-xs text-slate-500 mt-2 font-medium">
                          {Math.round((result.confidence || 0) * 100)}% Confidence
                        </span>
                      </>
                    ) : (
                      <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">Pending AI</span>
                    )}
                  </div>

                  {/* Chevron */}
                  <div className="hidden md:flex shrink-0 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {/* Expanded View */}
                {isExpanded && result && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-6 animate-in slide-in-from-top-2 fade-in duration-200">
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Verification Details
                    </h4>
                    
                    {hasFailed ? (
                      <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                        <p className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Policy Violations Found
                        </p>
                        <ul className="space-y-2">
                          {result.reasons?.map((reason: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-red-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0"></span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-600">
                          This product passed all AI moderation checks perfectly. The image is a valid product, contains no prohibited contact information, and is not a duplicate.
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-end">
                      {hasFailed ? (
                        <button className="text-sm text-red-600 hover:text-red-700 font-medium px-4 py-2">
                          Delete Listing
                        </button>
                      ) : (
                        <button className="text-sm text-primary hover:text-primary-hover font-medium px-4 py-2">
                          Publish Listing
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
