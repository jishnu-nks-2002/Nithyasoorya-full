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
import Empavaidomegallery  from '@/component/Empavaidomegallery';
import { useGalleryHero } from '../../api/useGalleryHero';


const App: React.FC = () => {

  const { data, loading, error } = useGalleryHero();
 
  if (loading) return <div style={{ height: '100vh', background: '#0a0a0a' }} />;
  if (error)   return <p>Failed to load hero: {error}</p>;
  if (!data)   return null;

  return (
  <> 
  <CustomCursor />
      <ElegantNavbar />
       <FlowingMenu/>
      
    
        {/* Full-width hero section */}
      
          <GalleryHero 
          
           verticalText={data.verticalText}
      leftLabel={data.leftLabel}
      ctaText={data.ctaText}
      ctaLink={data.ctaLink}
      slides={data.slides}                   // slides come from MongoDB + Cloudinary
      autoPlayInterval={data.autoPlayInterval}/>
          {/* <Herobanner /> */}
         
   

        {/* Full-width about section */}
      
          <AboutSection  />
      
{/* <ProductCarousel  /> */}

        {/* Full-width services section */}
      
      <ServicesSection />

      <CuratedSection />
       
        

        {/* <InfinityScrollGallery /> */}
        <Empavaidomegallery  />
        
       

        {/* Full-width products section */}
      
         
     

        {/* Full-width portfolio section */}
       
          <MasonryGallery />

          <ReviewSection />
          <Footer />
       

        
   </>
  );
};

export default App;