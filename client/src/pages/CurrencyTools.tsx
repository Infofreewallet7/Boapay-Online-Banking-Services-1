import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Globe, TrendingUp, Clock } from "lucide-react";
import CurrencyConverter from "@/components/CurrencyConverter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CurrencyTools() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="container py-8 px-4 mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">
            Currency Tools
          </h1>
          <p className="text-muted-foreground text-center mb-10">
            Convert currencies and check exchange rates in real-time
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div>
              <CurrencyConverter />
            </div>
            
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Why Use Our Currency Converter?</h2>
              
              <div className="grid gap-4">
                <div className="flex items-start space-x-3 bg-muted/50 p-4 rounded-lg">
                  <div className="bg-primary rounded-full p-2 text-white mt-1">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Global Currencies</h3>
                    <p className="text-muted-foreground">
                      Access to all major global currencies with real-time conversion rates.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 bg-muted/50 p-4 rounded-lg">
                  <div className="bg-primary rounded-full p-2 text-white mt-1">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Accurate Rates</h3>
                    <p className="text-muted-foreground">
                      Our exchange rates are regularly updated to ensure the most accurate conversions.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 bg-muted/50 p-4 rounded-lg">
                  <div className="bg-primary rounded-full p-2 text-white mt-1">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Real-Time Updates</h3>
                    <p className="text-muted-foreground">
                      Currency rates are constantly monitored and updated throughout the day.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mt-6">
                <h3 className="font-semibold text-lg mb-2">Plan International Travel</h3>
                <p className="mb-4">
                  Use our currency converter to plan your international travel budget accurately.
                  Know exactly how much your money is worth in your destination's currency.
                </p>
                <p className="text-sm text-muted-foreground">
                  Planning a trip? Check out our international transfer services for the best
                  rates when sending money abroad.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12 mb-8">
            <h2 className="text-2xl font-bold mb-4">Need to Transfer Money Internationally?</h2>
            <p className="max-w-2xl mx-auto mb-6">
              Boapay offers competitive rates for international money transfers.
              Save on fees and get better exchange rates than traditional banks.
            </p>
            <div className="flex justify-center gap-4">
              <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md transition">
                Learn More
              </button>
              <button className="border border-primary text-primary hover:bg-primary/10 px-6 py-2 rounded-md transition">
                Start a Transfer
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}