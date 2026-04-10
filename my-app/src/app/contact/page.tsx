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
import ProductBreadcrumb from '@/component/ProductBreadcrumb';
import ConnectSection from '@/component/Connectsection';


const App: React.FC = () => {
  return (
  <> 
  <CustomCursor />
      <ElegantNavbar />
       <FlowingMenu/>
     
<ProductBreadcrumb 
  items={[{ label: "Home", href: "/" }, { label: "Contact", href: "/contact" }]}
  productName="Contact"
/>
      
      <ConnectSection />
    
      
       
          {/* <MasonryGallery /> */}

          <ReviewSection />
          <Footer />
       

        
   </>
  );
};

export default App;