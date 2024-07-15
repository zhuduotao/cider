import {ReactNode} from "react";

const MainContainer = (props: {
  children: ReactNode|ReactNode[]
}) =>{
  return (
    <div className="w-full h-full overflow-hidden">
      {props.children}
    </div>
  )
}
export default MainContainer