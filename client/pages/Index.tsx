import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
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

export default function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [recentDreams, setRecentDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);

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
    async function fetchRecentDreams() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("dreams")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3); // Apenas 3 sonhos mais recentes

        if (error) {
          console.error("Error fetching recent dreams:", error);
        } else {
          setRecentDreams(data || []);
        }
      } catch (error) {
        console.error("Error fetching dreams:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentDreams();

    // Atualiza os sonhos a cada 30 segundos para mostrar novos
    const interval = setInterval(fetchRecentDreams, 30000);

    return () => clearInterval(interval);
  }, []);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        radius: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const animate = () => {
      ctx.fillStyle = "rgba(15, 15, 31, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        ctx.fillStyle = `rgba(127, 90, 240, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();

        particles.forEach((other) => {
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.strokeStyle = `rgba(127, 90, 240, ${
              (particle.opacity * (1 - distance / 150)) / 2
            })`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // --- FEATURES ---
  const FEATURES = [
    {
      title: "Digital Permanence",
      description:
        "Your wish becomes part of a collective monument of human aspirations",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12 text-neon-primary group-hover:scale-110 transition-transform"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
          <path d="M3 7l9 5 9-5" opacity="0.5" />
          <path d="M12 22V12" opacity="0.5" />
        </svg>
      ),
    },
    {
      title: "Community Inspiration",
      description: "Inspire millions by sharing your dreams and aspirations",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12 text-neon-primary group-hover:scale-110 transition-transform"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 2v4" />
          <path d="M12 18v4" />
          <path d="M4.93 4.93l2.83 2.83" />
          <path d="M16.24 16.24l2.83 2.83" />
          <path d="M2 12h4" />
          <path d="M18 12h4" />
          <circle cx="12" cy="12" r="3.5" />
        </svg>
      ),
    },
    {
      title: "Eternal Legacy",
      description: "Your dreams will be preserved for generations to come",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-12 h-12 text-neon-primary group-hover:scale-110 transition-transform"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M18.5 7c-1.5-2-4-2-6 0s-4.5 2-6 0" />
          <path d="M18.5 17c-1.5 2-4 2-6 0s-4.5-2-6 0" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark overflow-hidden">
      <Header />

      <canvas
        ref={canvasRef}
        className="fixed inset-0 opacity-30 pointer-events-none"
      />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-8 pt-20">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-secondary/5 rounded-full blur-3xl animate-pulse" />
          </div>

          <div className="relative z-10 text-center max-w-4xl">
            <h1 className="font-orbitron font-bold text-hero-mobile sm:text-hero-desktop leading-tight mb-6 text-white">
              Turn your dreams into{" "}
              <span className="bg-gradient-to-r from-neon-primary to-neon-secondary bg-clip-text text-transparent">
                digital monuments
              </span>
            </h1>

            <p className="font-exo2 text-subhero-mobile sm:text-subhero-desktop text-neon-secondary mb-8 font-light">
              Share your wish and inspire the future
            </p>

            <Link
              to="/submit"
              className="inline-block neon-button text-base sm:text-lg animate-glow"
            >
              Submit My Wish – 1 USD
            </Link>

            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
              <svg
                className="w-6 h-6 text-neon-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-20 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-center mb-16 text-white">
              Why Share Your Dream?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {FEATURES.map((feature, idx) => (
                <div
                  key={idx}
                  className="card-dark p-6 rounded-lg backdrop-blur-sm hover:shadow-glow-neon transition-all duration-300 group cursor-pointer"
                >
                  <div className="mb-4 flex items-center justify-center">
                    {feature.icon}
                  </div>

                  <h3 className="text-xl font-orbitron font-bold text-neon-primary mb-2 text-center">
                    {feature.title}
                  </h3>

                  <p className="text-neon-secondary/80 font-exo2 text-sm text-center">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Dreams Section */}
        <section className="relative py-20 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-orbitron text-3xl sm:text-4xl font-bold mb-4 text-white">
              Recent Dreams
            </h2>

            <p className="text-neon-secondary/70 mb-12 font-exo2">
              Latest wishes from dreamers around the world
            </p>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neon-primary mb-4"></div>
                <p className="text-neon-secondary">Loading recent dreams...</p>
              </div>
            ) : recentDreams.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neon-secondary mb-4">No dreams yet</p>
                <p className="text-sm text-neon-secondary/70">
                  Be the first to submit a dream!
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recentDreams.map((dream) => (
                    <Link
                      to={`/dream/${dream.id}`}
                      key={dream.id}
                      className="card-dark p-6 rounded-lg backdrop-blur-sm hover:shadow-glow-neon hover:scale-105 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="h-40 overflow-hidden mb-4">
                        <p className="text-neon-secondary font-rajdhani line-clamp-5">
                          "{dream.description}"
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-neon-primary/20">
                        <div>
                          <span className="text-sm text-neon-secondary/70 font-rajdhani block">
                            {dream.author || "Anonymous"}
                          </span>
                          <span className="text-xs text-neon-secondary/50 block mt-1">
                            {dream.country || "Unknown"}
                          </span>
                        </div>
                        <span className="text-xs text-neon-primary/50">
                          {formatDate(dream.created_at)}
                        </span>
                      </div>

                      <div className="flex justify-between mt-4 text-xs text-neon-secondary/70">
                        <span>Likes: {dream.likes || 0}</span>
                        <span>Views: {dream.views || 0}</span>
                      </div>

                      <div className="mt-4 pt-4 border-t border-neon-primary/10">
                        <span className="text-xs text-neon-primary hover:text-neon-secondary transition-colors inline-flex items-center">
                          View full dream →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Contador de sonhos */}
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center gap-2 bg-dark-card/30 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-neon-primary animate-pulse"></div>
                    <span className="text-sm text-neon-secondary">
                      Showing {recentDreams.length} most recent dreams
                    </span>
                  </div>
                  <p className="text-xs text-neon-secondary/50 mt-2">
                    Automatically updates with new submissions
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-center mt-12">
              <Link to="/gallery" className="neon-button">
                View All Dreams
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}