"use client";
import React from 'react';
import ElegantNavbar from '@/component/ElegantNavbar';




import MasonryGallery from '@/component/Masonrygallery';


import ReviewSection from '@/component/Reviewsection';
import Footer from '@/component/Footer';
import CustomCursor from '@/component/Customcursor';
import FlowingMenu from '@/component/Flowingmenu';

import ArtistryHero from '@/component/ArtistryHero';
import CrystalArtDecorPage from '@/component/CrystalArtDecor';
import ProductDetailPage from '@/component/ProductDetailPage';
import ProductBreadcrumb from '@/component/ProductBreadcrumb';


const App: React.FC = () => {
  return (
  <> 
  <CustomCursor />
      <ElegantNavbar />
       <FlowingMenu/>
       <ProductBreadcrumb
  items={[
    { label: "Home", href: "/" },
    { label: "Collections", href: "/collections" },
    { label: "Crystal Art Decor", href: "/collections/crystal-art-decor" },
  ]}
  productName="Nocturnal Core"
  productSeries="Obsidian Dream"
  productCategory="Crystal Art Decor"
  backgroundImage="/images/p-4.jpeg "
/>
        {/* <ArtistryHero 
                videoSrc="/images/videos/video-1.mp4"
      
              /> */}
      <ProductDetailPage />
    
    
          <MasonryGallery />

          <ReviewSection />
          <Footer />
       

        
   </>
  );
};

export default App;