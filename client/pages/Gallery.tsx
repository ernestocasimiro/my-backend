import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import supabase from '@/config/supabaseClient';

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

export default function Gallery() {
  const [wishes, setWishes] = useState<Dream[]>([]);
  const [page, setPage] = useState(0);
  const itemsPerPage = 6;
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const localLikedKey = (id: string) => `liked_dream_${id}`;

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
    setPage(0);
    setWishes([]);
    setHasMore(true);
    fetchPage(0);
  }, [sortBy]);

  async function fetchPage(pageNumber: number) {
    setError(null);
    if (pageNumber === 0) setLoading(true);
    else setLoadingMore(true);

    const from = pageNumber * itemsPerPage;
    const to = from + itemsPerPage - 1;

    try {
      let query = supabase
        .from("dreams")
        .select("*");

      // Apenas para "popular", filtra os sonhos com likes > 0
      if (sortBy === "popular") {
        // Filtra apenas sonhos com pelo menos 1 like
        query = query.gt("likes", 0);
      }

      // Ordenação baseada na aba selecionada
      if (sortBy === "newest") {
        query = query.order("created_at", { ascending: false });
      } else {
        // Para "popular", ordena por likes (desc) e depois views (desc)
        query = query.order("likes", { ascending: false })
                    .order("views", { ascending: false });
      }

      const { data, error: fetchError } = await query.range(from, to);

      if (fetchError) {
        console.error("Error fetching dreams:", fetchError);
        setError("Failed to load dreams.");
      } else {
        setWishes((prev) => (pageNumber === 0 ? data || [] : [...prev, ...(data || [])]));
        if (!data || data.length < itemsPerPage) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while loading dreams.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  const loadMore = async () => {
    if (!hasMore) return;
    const next = page + 1;
    setPage(next);
    await fetchPage(next);
  };

  const handleLike = async (dreamId: string, index: number) => {
    if (localStorage.getItem(localLikedKey(dreamId))) return;

    try {
      const { error: rpcError } = await supabase.rpc("increment_dream_likes", {
        p_dream_id: dreamId,
      });
      if (rpcError) {
        console.error("RPC error incrementing likes:", rpcError);
        return;
      }
      localStorage.setItem(localLikedKey(dreamId), "1");

      setWishes((prev) => {
        const next = [...prev];
        if (next[index]) {
          next[index] = { ...next[index], likes: (next[index].likes || 0) + 1 };
        }
        return next;
      });
    } catch (err) {
      console.error("Error liking dream:", err);
    }
  };

  const handleViewIncrement = async (dreamId: string, index: number) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("dreams")
        .select("views")
        .eq("id", dreamId)
        .single();

      if (fetchError) {
        console.error("Error fetching views:", fetchError);
        return;
      }

      await supabase
        .from("dreams")
        .update({ views: (data.views || 0) + 1 })
        .eq("id", dreamId);

      setWishes((prev) => {
        const next = [...prev];
        if (next[index]) {
          next[index] = { ...next[index], views: (next[index].views || 0) + 1 };
        }
        return next;
      });
    } catch (err) {
      console.error("Error incrementing views:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />

      <main className="pt-32 pb-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-4">
              Gallery of Dreams
            </h1>
            <p className="text-neon-secondary font-exo2 mb-8">
              Discover dreams submitted by people around the world
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => setSortBy("newest")}
                  className={`px-4 py-2 rounded-lg font-exo2 text-sm transition-all ${
                    sortBy === "newest"
                      ? "bg-neon-primary text-dark-bg shadow-glow-neon"
                      : "bg-dark-card border border-neon-primary/30 text-neon-secondary hover:border-neon-primary"
                  }`}
                >
                  Newest
                </button>

                <button
                  onClick={() => setSortBy("popular")}
                  className={`px-4 py-2 rounded-lg font-exo2 text-sm transition-all ${
                    sortBy === "popular"
                      ? "bg-neon-primary text-dark-bg shadow-glow-neon"
                      : "bg-dark-card border border-neon-primary/30 text-neon-secondary hover:border-neon-primary"
                  }`}
                >
                  Most Popular
                </button>
              </div>

              <p className="text-neon-secondary/70 text-sm font-exo2">{wishes.length} dreams</p>
            </div>
          </div>

          {loading && wishes.length === 0 ? (
            <div className="text-center py-20 text-neon-secondary/70">Loading...</div>
          ) : (
            <>
              {/* Mensagem quando não há sonhos populares */}
              {sortBy === "popular" && wishes.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-neon-secondary mb-4">No popular dreams yet</p>
                  <p className="text-sm text-neon-secondary/70">
                    Popular dreams need at least 1 like
                  </p>
                </div>
              )}

              {/* Grid de sonhos */}
              {wishes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishes.map((d, idx) => (
                    <Link
                      to={`/dream/${d.id}`}
                      key={d.id}
                      onClick={() => handleViewIncrement(d.id, idx)}
                      className="card-dark p-6 rounded-lg hover:shadow-glow-neon hover:scale-105 transition-all duration-300 animate-scale-in"
                    >
                      <p className="text-neon-secondary font-rajdhani text-base mb-6 leading-relaxed line-clamp-4">
                        "{d.description}"
                      </p>

                      <div className="flex justify-between items-center mb-4 pb-4 border-t border-neon-primary/20">
                        <div>
                          <p className="text-sm font-exo2 text-neon-primary">{d.author || "Anonymous"}</p>
                          <p className="text-xs text-neon-secondary/60">{d.country || "Unknown"}</p>
                          <p className="text-xs text-neon-secondary/40">
                            {formatDate(d.created_at)}
                          </p>
                          <p className="text-xs text-neon-secondary/40">
                            Views: {d.views || 0}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleLike(d.id, idx);
                            }}
                            className={`px-3 py-1 rounded flex items-center gap-2 ${
                              localStorage.getItem(`liked_dream_${d.id}`) ? "opacity-60 cursor-default" : ""
                            }`}
                            aria-label={`Like dream ${d.id}`}
                          >
                            <svg
                              className="w-4 h-4"
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
                            <span className="text-xs font-exo2">{d.likes || 0}</span>
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="flex justify-center mt-8">
            {hasMore && wishes.length > 0 ? (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-3 bg-neon-primary rounded-lg text-dark-bg font-bold"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            ) : (
              wishes.length > 0 && (
                <p className="text-neon-secondary/70">No more dreams</p>
              )
            )}
          </div>

          {error && <p className="mt-6 text-center text-red-400">{error}</p>}
        </div>
      </main>

      <Footer />
    </div>
  );
}