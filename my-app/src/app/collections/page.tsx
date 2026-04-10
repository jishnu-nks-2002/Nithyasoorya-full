"use client";
import React from 'react';
import ElegantNavbar from '@/component/ElegantNavbar';

import GalleryHero from '@/component/Galleryhero';
import AboutSection from '@/component/Aboutsection';
import InfinityScrollGallery from '@/component/Infinitegallerymenu';

import ProductCarousel from '@/component/Productcarousel';
import MasonryGallery from '@/component/Masonrygallery';
import ServicesSection from '@/component/Servicessection';
import Herobanner from '@/component/Herobanner';
import ReviewSection from '@/component/Reviewsection';
import Footer from '@/component/Footer';
import CustomCursor from '@/component/Customcursor';
import FlowingMenu from '@/component/Flowingmenu';
import CuratedSection from '@/component/CuratedSection';
import CollectionSection from '@/component/Collections';
import ArtistryHero from '@/component/ArtistryHero';


const App: React.FC = () => {
  return (
  <> 
  <CustomCursor />
      <ElegantNavbar />
       <FlowingMenu/>
        {/* <ArtistryHero 
                videoSrc="/images/videos/video-1.mp4"
         
              /> */}
      
    
      
       <CollectionSection />
          <MasonryGallery />

          <ReviewSection />
          <Footer />
       

        
   </>
  );
};

export default App;