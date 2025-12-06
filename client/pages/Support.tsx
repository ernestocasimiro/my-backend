import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Support() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <main className="pt-32 pb-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-orbitron text-4xl sm:text-5xl font-bold text-white mb-6">
            Support Center
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-dark-card/50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-neon-primary mb-4">Technical Issues</h2>
              <p className="text-neon-secondary mb-4">
                Having trouble with payments or submission?
              </p>
              <ul className="space-y-2 text-neon-secondary">
                <li>• Clear your browser cache</li>
                <li>• Try a different browser</li>
                <li>• Check your internet connection</li>
                <li>• Contact: dreamsmonument@gmail.com</li>
              </ul>
            </div>
            
            <div className="bg-dark-card/50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-neon-primary mb-4">Payment Support</h2>
              <p className="text-neon-secondary">
                For payment-related issues, please contact Stripe support.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}