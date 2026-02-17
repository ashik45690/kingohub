import Feature from "../components/common/Feature";
import Footer from "../components/common/Footer";
import Navbar from "../components/common/Navbar";
import heroImage from '../assets/images/hero.png'
import { useEffect, useRef } from "react";
import gsap from 'gsap'
import GoogleAuthLogin from "../components/Authentication/GoogleLogin";
import { useNavigate } from "react-router-dom";



export default function Home() {

 const navigate = useNavigate()

  const containerref = useRef();


  useEffect(()=>{
    const ctx = gsap.context(()=>{

       gsap.set(".hero-btn", { opacity: 1 });

      const t1 = gsap.timeline();


      t1.from('.hero-title',{
        y:50,
        opacity:0,
        duration:0.8
      })
      .from('.hero-para',{
        y:30,
        opacity:0,
        duration:0.6
      })
      .from('.join-btn',{
        
        y:30,
        opacity:1,
        duration:0.5,
        ease:"back.out(1.7)"
      })
      .from('.hero-img',{
        x:100,
        opacity:0,
        duration:1
      },
    "-=1"
    )


      gsap.to('.hero-img',{
        y:15,
        repeat:-1,
        yoyo:true,
        duration:2,
        ease:'power1.inOut'

      })
    },containerref)


    return ()=> ctx.revert()
  },[])
  
  return (
    <>
      <div className="bg-white" ref={containerref}>
        <Navbar/>
        <section className="bg-white bg-opacity-30 py-10 sm:py-16 lg:py-24">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
              <div>
                <p className="text-base font-semibold tracking-wider text-blue-600 uppercase">
                  A social media for learners
                </p>

                <h1 className="hero-title mt-4 text-4xl font-bold text-black lg:mt-8 sm:text-4xl xl:text-7xl">
                  Connect & learn from the experts
                </h1>

                <p className="hero-para text-black mt-8">
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                  Quibusdam velit doloremque consequatur quia.
                </p>

                

               <GoogleAuthLogin click={()=>navigate('/kingohub/Dashboard')} />

                
              </div>

              <div>
                <img
                  className="hero-img w-full mix-blend-multiply"
                  src={heroImage}
                  alt=""
                />
              </div>
            </div>
          </div>
        </section>

        <Feature />

        <footer>
          <Footer/>
        </footer>
      </div>
    </>
  );
}
