"use client";
import React from 'react';
import ElegantNavbar from '../../component/ElegantNavbar';
import '../page.css';

import CustomCursor from '@/component/Customcursor';
import FlowingMenu from '@/component/Flowingmenu';
import EmpavaiHero from '@/component/Empavaihero';
import EmpavaiAbout from '@/component/Empavaiabout';
import ArtistryHero from '@/component/ArtistryHero';
import CuratedSection from '@/component/CuratedSection';
import ArtistSection from '@/component/ArtistSection';
import MasonryGallery from '@/component/Masonrygallery';
import ReviewSection from '@/component/Reviewsection';
import Footer from '@/component/Footer';


const App: React.FC = () => {
  return (
  <> 
  <CustomCursor />
      <ElegantNavbar />
       <FlowingMenu/>
       {/* <EmpavaiHero /> */}
       <ArtistryHero 
  videoSrc="/images/videos/video-1.mp4"
/>
       <EmpavaiAbout />
        <ArtistSection />
       <CuratedSection />
      
        <MasonryGallery />

         <ReviewSection />
          <Footer />
      
      
    
      
       

        
   </>
  );
};

export default App;