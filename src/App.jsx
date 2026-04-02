import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Ticker from './components/Ticker';
import Teams from './components/Teams';
import Publications from './components/Publications';
import Members from './components/Members';
import PhDTracker from './components/PhDTracker';
import NewsGallery from './components/NewsGallery';
import Contact from './components/Contact';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <Teams />
        <Publications />
        <Members />
        <PhDTracker />
        <NewsGallery />
        <Contact />
      </main>
    </>
  );
}
