export default function ProductCard() {
  return (
    <div className="w-full max-w-[400px] w-full group cursor-pointer relative">
      <div 
        className="w-full aspect-square relative flex items-center justify-center overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ backgroundColor: "#EFECE6" }}
      >
        {/* Subtle interior glow/shadow for premium depth */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out" 
             style={{ boxShadow: "inset 0 0 60px rgba(255,255,255,0.4)" }} />

        {/* The Product Image */}
        <img
          src="https://images.unsplash.com/photo-1605100804763-247f52bcfdcb?auto=format&fit=crop&q=80&w=800"
          alt="Luxury Jewelry Piece"
          className="w-full h-full object-contain transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          style={{ padding: "20px", mixBlendMode: "multiply" }}
          onError={(e) => {
            // fallback generic ring
            e.currentTarget.src = "https://images.unsplash.com/photo-1599643478514-46b14243dcbd?auto=format&fit=crop&q=80&w=800";
          }}
        />
      </div>
    </div>
  );
}
