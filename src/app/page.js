'use client'
import Image from "next/image";
import Division from "@/components/Division";
import AreaChartComponent from "@/components/AreaChartfComponent";
import BarChartComponent from "@/components/BarChartComponent";
import LineChartComponent from "@/components/LineChartComponent";
import PieChartComponent from "@/components/PieChartComponent";


export default function Home() {
  

  return (
     <main className="flex min-h-screen flex-col items-center justify-center px-4 md:px-8 xl:px-10">
      <div className="grid xl:grid-cols-3 lg:grid-cols-2 w-full gap-10 max-w-350">
          <Division title="Area Chart">
             <AreaChartComponent/>
          </Division>
          <Division title="Bar Chart">
             <BarChartComponent/>
          </Division>
          <Division title="Line Chart">
             <LineChartComponent/>
          </Division>
           
           
      </div>
     </main>
  );
}


