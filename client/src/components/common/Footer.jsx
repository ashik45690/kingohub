import { useEffect } from "react";
import { FaFacebook, FaTwitterSquare, FaInstagramSquare, FaLinkedin } from "react-icons/fa";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main blocks reveal
      gsap.from(".footer-item", {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".footer-section",
          start: "top 80%",
        },
      });

      // Social icons pop
      gsap.from(".footer-social li", {
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ".footer-section",
          start: "top 80%",
        },
      });

      // Bottom elements
      gsap.from(".footer-bottom", {
        y: 20,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".footer-section",
          start: "top 85%",
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="footer-section py-10 bg-gray-50 sm:pt-16 lg:pt-24">
      <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-2 md:col-span-3 lg:grid-cols-6 gap-y-16 gap-x-12">
          
          {/* Logo + About */}
          <div className="footer-item col-span-2 md:col-span-3 lg:col-span-2 lg:pr-8">
            <h1 className="flex font-[bingo] text-2xl font-bold md:text-4xl">
              kingohub
            </h1>

            <p className="text-base leading-relaxed text-gray-600 mt-7">
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do
              amet sint. Velit officia consequat duis enim velit mollit.
            </p>

            <ul className="footer-social flex items-center space-x-3 mt-9">
              <li>
                <a href="#" className="flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-8 h-8 hover:bg-blue-600">
                  <FaFacebook />
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-8 h-8 hover:bg-blue-600">
                  <FaTwitterSquare />
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-8 h-8 hover:bg-blue-600">
                  <FaInstagramSquare />
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-8 h-8 hover:bg-blue-600">
                  <FaLinkedin />
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-item">
            <p className="text-sm font-semibold tracking-widest text-gray-400 uppercase">
              Company
            </p>
            <ul className="mt-6 space-y-4">
              <li><a href="#" className="flex text-base hover:text-blue-600">About</a></li>
              <li><a href="#" className="flex text-base hover:text-blue-600">Features</a></li>
              <li><a href="#" className="flex text-base hover:text-blue-600">Works</a></li>
              <li><a href="#" className="flex text-base hover:text-blue-600">Career</a></li>
            </ul>
          </div>

          {/* Help */}
          <div className="footer-item">
            <p className="text-sm font-semibold tracking-widest text-gray-400 uppercase">
              Help
            </p>
            <ul className="mt-6 space-y-4">
              <li><a href="#" className="flex text-base hover:text-blue-600">Customer Support</a></li>
              <li><a href="#" className="flex text-base hover:text-blue-600">Delivery Details</a></li>
              <li><a href="#" className="flex text-base hover:text-blue-600">Terms & Conditions</a></li>
              <li><a href="#" className="flex text-base hover:text-blue-600">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Subscribe */}
          <div className="footer-item col-span-2 md:col-span-1 lg:col-span-2 lg:pl-8">
            <p className="text-sm font-semibold tracking-widest text-gray-400 uppercase">
              Subscribe to newsletter
            </p>

            <form className="mt-6">
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="block w-full p-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 caret-blue-600"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center px-6 py-4 mt-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <hr className="footer-bottom mt-16 mb-10 border-gray-200" />

        <p className="footer-bottom text-sm text-center text-gray-600">
          © Copyright 2021, All Rights Reserved by Postcraft
        </p>
      </div>
    </section>
  );
}
