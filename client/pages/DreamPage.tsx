import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import supabase from "@/config/supabaseClient";

type Dream = {
  id: string;
  title?: string | null;
  description?: string | null;
  author?: string | null;
  country?: string | null;
  language?: string | null;
  likes?: number | null;
  views?: number | null;
  created_at?: string | null;
};

export default function DreamPage() {
  const { id } = useParams<{ id: string }>();
  const [dream, setDream] = useState<Dream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const localLikedKey = (dreamId: string) => `liked_dream_${dreamId}`;

  // Função para formatar data em inglês
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    
    // Formato em inglês: "MMM DD, YYYY" (ex: "Dec 03, 2024")
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  useEffect(() => {
    if (!id) return;

    async function fetchDream() {
      setLoading(true);
      setError(null);

      try {
        // Buscar sonho
        const { data, error: fetchError } = await supabase
          .from("dreams")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) {
          console.error(fetchError);
          setError("Dream not found.");
          setLoading(false);
          return;
        }

        // Incrementar contador de visualizações
        await supabase
          .from("dreams")
          .update({ views: (data.views || 0) + 1 })
          .eq("id", id);

        setDream({ ...data, views: (data.views || 0) + 1 });
      } catch (err) {
        console.error(err);
        setError("Error loading dream.");
      } finally {
        setLoading(false);
      }
    }

    fetchDream();
  }, [id]);

  const handleLike = async () => {
    if (!dream) return;
    if (localStorage.getItem(localLikedKey(dream.id))) return;

    try {
      const { error: rpcError } = await supabase.rpc("increment_dream_likes", {
        p_dream_id: dream.id,
      });

      if (rpcError) {
        console.error(rpcError);
        return;
      }

      localStorage.setItem(localLikedKey(dream.id), "1");
      setDream({ ...dream, likes: (dream.likes || 0) + 1 });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="text-center py-20 text-neon-secondary/70">Loading...</p>;
  if (error || !dream) return <p className="text-center py-20 text-red-400">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />

      <main className="pt-32 pb-20 px-4 sm:px-8 max-w-3xl mx-auto">
        <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-6">
          {dream.title || "Untitled Dream"}
        </h1>

        <p className="text-neon-secondary font-rajdhani text-base mb-6 leading-relaxed">
          {dream.description}
        </p>

        <div className="flex justify-between items-center mb-6 border-t border-neon-primary/20 pt-4">
          <div>
            <p className="text-sm font-exo2 text-neon-primary">{dream.author || "Anonymous"}</p>
            <p className="text-xs text-neon-secondary/60">{dream.country || "Unknown"}</p>
            <p className="text-xs text-neon-secondary/40">
              {formatDate(dream.created_at)}
            </p>
            <p className="text-xs text-neon-secondary/40">Views: {dream.views || 0}</p>
          </div>

          <button
            onClick={handleLike}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 font-exo2 ${
              localStorage.getItem(localLikedKey(dream.id)) ? "opacity-60 cursor-default" : "bg-neon-primary text-dark-bg"
            }`}
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
            <span>{dream.likes || 0}</span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}