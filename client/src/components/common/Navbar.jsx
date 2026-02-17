import { useEffect } from "react";
import { BsFillInfoCircleFill } from "react-icons/bs";
import gsap  from "gsap";
export default function Navbar() {


  return (
    <header class="pb-6 bg-white lg:pb-0">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <nav class="flex items-center justify-between h-16 lg:h-20">
          <div class="flex-shrink-0">
            <a href="#" title="" class="logo flex font-[bingo] text-2xl font-bold md:text-4xl">
             Kingohub
            </a>
          </div>
          <div>
           <BsFillInfoCircleFill/>
          </div>
        </nav>
      </div>
    </header>
  );
}
