import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import supabase from "@/config/supabaseClient";

export default function DreamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dream, setDream] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);

  // Fetch dream by ID
  useEffect(() => {
    if (!id) return;

    async function fetchDream() {
      const { data, error } = await supabase
        .from("dreams")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching dream:", error);
        setDream(null);
      } else {
        setDream(data);
      }

      setLoading(false);
    }

    fetchDream();
  }, [id]);

  // LIKE handler
  async function handleLike() {
    if (!dream) return;

    setLikeLoading(true);

    const { data, error } = await supabase
      .from("dreams")
      .update({ likes: dream.likes + 1 })
      .eq("id", dream.id)
      .select()
      .single();

    if (!error) setDream(data);

    setLikeLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center text-neon-secondary">
        Loading dream...
      </div>
    );
  }

  if (!dream) {
    return (
      <div className="min-h-screen bg-gradient-dark flex flex-col items-center justify-center text-neon-secondary">
        <p>Dream not found.</p>
        <button
          onClick={() => navigate("/gallery")}
          className="mt-4 px-4 py-2 bg-neon-primary text-dark-bg rounded-lg shadow-glow-neon"
        >
          Back to Gallery
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />

      <main className="pt-32 pb-20 px-4 sm:px-8 max-w-4xl mx-auto">
        {/* Title */}
        <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-6">
          {dream.title}
        </h1>

        {/* Author info */}
        <div className="text-neon-secondary mb-6 font-exo2">
          <p>
            <span className="text-neon-primary">By:</span> {dream.author}
          </p>
          {dream.country && (
            <p>
              <span className="text-neon-primary">Country:</span> {dream.country}
            </p>
          )}
          {dream.language && (
            <p>
              <span className="text-neon-primary">Language:</span> {dream.language}
            </p>
          )}
          <p className="text-neon-secondary/60 text-sm mt-1">
            Published on{" "}
            {new Date(dream.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Description */}
        <div className="card-dark p-6 rounded-lg mb-8 leading-relaxed text-neon-secondary">
          {dream.description}
        </div>

        {/* Like button */}
        <button
          onClick={handleLike}
          disabled={likeLoading}
          className="flex items-center gap-2 px-4 py-2 bg-neon-primary text-dark-bg rounded-lg shadow-glow-neon hover:scale-105 transition-all"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>{dream.likes}</span>
        </button>

        {/* Back button */}
        <div className="mt-10">
          <button
            onClick={() => navigate("/gallery")}
            className="px-4 py-2 bg-dark-card text-neon-secondary border border-neon-primary/40 rounded-lg hover:border-neon-primary transition-all"
          >
            ← Back to Gallery
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
