import { FcGoogle } from "react-icons/fc";

export default function GoogleAuthLogin({click}) {
    
    return (

<div className="px-6 inline-flex items-center gap-2 py-2.5 text-white bg-indigo-600 mt-6 rounded-lg">
            <FcGoogle />
            <a href="#" className="text-white font-medium text-semi " onClick={click}>Sign With Google</a>
        </div>
    )
}