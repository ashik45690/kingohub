import { useEffect } from "react";
import { FaFacebook, FaTwitterSquare, FaInstagramSquare, FaLinkedin } from "react-icons/fa";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  useEffect(() => {
    const ctx = gsap.context(() => {
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
              Kingohub
            </h1>

            <p className="text-base leading-relaxed text-gray-600 mt-7">
              Kingohub is a modern online examination platform designed to help
              institutions, trainers, and organizations conduct secure exams,
              manage students, and analyze performance with powerful insights.
            </p>

            <ul className="footer-social flex items-center space-x-3 mt-9">
              <li>
                <a
                  href="#"
                  className="flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-8 h-8 hover:bg-blue-600"
                >
                  <FaFacebook />
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-8 h-8 hover:bg-blue-600"
                >
                  <FaTwitterSquare />
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-8 h-8 hover:bg-blue-600"
                >
                  <FaInstagramSquare />
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-8 h-8 hover:bg-blue-600"
                >
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
              <li>
                <a href="#" className="flex text-base hover:text-blue-600">
                  About Kingohub
                </a>
              </li>

              <li>
                <a href="#" className="flex text-base hover:text-blue-600">
                  Platform Features
                </a>
              </li>

              <li>
                <a href="#" className="flex text-base hover:text-blue-600">
                  Exam Analytics
                </a>
              </li>

              <li>
                <a href="#" className="flex text-base hover:text-blue-600">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div className="footer-item">
            <p className="text-sm font-semibold tracking-widest text-gray-400 uppercase">
              Help
            </p>

            <ul className="mt-6 space-y-4">
              <li>
                <a href="#" className="flex text-base hover:text-blue-600">
                  Student Guide
                </a>
              </li>

              <li>
                <a href="#" className="flex text-base hover:text-blue-600">
                  Instructor Help
                </a>
              </li>

              <li>
                <a href="#" className="flex text-base hover:text-blue-600">
                  Terms & Conditions
                </a>
              </li>

              <li>
                <a href="#" className="flex text-base hover:text-blue-600">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-item col-span-2 md:col-span-1 lg:col-span-2 lg:pl-8">
            <p className="text-sm font-semibold tracking-widest text-gray-400 uppercase">
              Stay Updated with Kingohub
            </p>

            <form className="mt-6">
            

              <button
                type="submit"
                className="inline-flex items-center justify-center px-18 py-4 mt-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Explore
              </button>
            </form>
          </div>
        </div>

        <hr className="footer-bottom mt-16 mb-10 border-gray-200" />

        <p className="footer-bottom text-sm text-center text-gray-600">
          © 2026 Kingohub. All rights reserved.
        </p>
      </div>
    </section>
  );
}