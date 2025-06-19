"use client";

import { useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const CustomizedCakesPage = () => {
  const customCakeTypes = [
    {
      id: 1,
      title: "Birthday Celebrations",
      image: "/images/birthday1.webp",
    },
    {
      id: 2,
      title: "Wedding Elegance",
      image: "/images/engagement.webp",
    },
    {
      id: 3,
      title: "Kids Special",
      image: "/images/kid.webp",
    },
    {
      id: 4,
      title: "Anniversary Bliss",
      image: "/images/aniversary.webp",
    },
    {
      id: 5,
      title: "Corporate Events",
      image: "/images/designcake.webp",    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-red-500 text-white py-10 ">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl  font-bold mb-4">
                Want A Customized Cake?
              </h1>
              <p className="text-lg md:text-xl font-light mb-8 text-gray-200">
                Let Our Experts Help You
              </p>
            </div>
          </div>
        </div>

        {/* Illustration Section - Simplified */}
        <div className=" py-6 bg-white">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto mb-8">
              {/* Replace with your actual image path or URL */}
              <Image 
                src="/whatsappQuery.svg" 
                alt="Customized Cake Illustration" 
                width={300} 
                height={300}
                className="mx-auto" 
              />            
              </div>            
            {/* Using the new WhatsApp component */}
            <div className="mt-4">
              <WhatsAppButton 
                variant="inline" 
                message="Hi! I would like to know more about customized cakes."
                showIcon="message"
                className="mx-auto"
              />
            </div>
          </div>
        </div>

        <div className=" bg-white my-10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                Our Customised Cakes
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 ">
              {customCakeTypes.map((cake) => (
                <div
                  key={cake.id}
                  className="bg-white rounded-lg overflow-hidden text-center"
                >
                  <div className="relative w-full h-40 md:h-48 mb-2">
                    <Image
                      src={cake.image}
                      alt={cake.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-md md:text-lg font-semibold text-gray-700 px-2">
                    {cake.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CustomizedCakesPage;
