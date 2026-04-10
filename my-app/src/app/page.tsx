"use client";
import React from 'react';
import ElegantNavbar from '../component/ElegantNavbar';
import './page.css';
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
import GallerySection from '@/component/Gallerysection';


const App: React.FC = () => {
  return (
  <> 
  <CustomCursor />
      <ElegantNavbar />
       <FlowingMenu/>
      
    
        {/* Full-width hero section */}
      
          <GalleryHero />
          {/* <Herobanner /> */}
         
   

        {/* Full-width about section */}
      
          <AboutSection  />
      
{/* <ProductCarousel  /> */}

        {/* Full-width services section */}
      
      <ServicesSection />

      <CuratedSection />
       
        

        {/* <InfinityScrollGallery /> */}
        <GallerySection />
        
       

        {/* Full-width products section */}
      
         
     

        {/* Full-width portfolio section */}
       
          <MasonryGallery />

          <ReviewSection />
          <Footer />
       

        
   </>
  );
};

export default App;