import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Image as ImageIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center max-w-4xl mx-auto">
      <div className="absolute top-0 right-1/4 -mt-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-3xl -z-10"></div>

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 border border-primary/20">
        <ShieldCheck className="w-4 h-4" />
        <span>AI Verification Engine Live</span>
      </div>

      <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
        Keep your marketplace <br className="hidden md:block" />
        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          clean and spam-free
        </span>
      </h1>

      <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
        ListingShield uses advanced AI to instantly verify product images, detect prohibited contact information, and prevent duplicate spam listings before they go live.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link 
          href="/register"
          className="px-8 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-full font-medium shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 group w-full sm:w-auto justify-center"
        >
          Get Started
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link 
          href="/login"
          className="px-8 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full font-medium shadow-sm transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          Login to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-left w-full">
        <div className="glass-card p-6 rounded-2xl">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Instant Verification</h3>
          <p className="text-slate-500 text-sm">Our AI pipeline processes images in milliseconds using optimized ONNX models.</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-4">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Image Integrity</h3>
          <p className="text-slate-500 text-sm">Automatically detects if an image is a genuine product, a screenshot, or a duplicate.</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Policy Enforcement</h3>
          <p className="text-slate-500 text-sm">Catches prohibited text like "WhatsApp me" or "Cash App only" embedded in images.</p>
        </div>
      </div>
    </div>
  );
}
