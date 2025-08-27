import { LeftSidebar } from "./LeftSideBar"
import { RightSideBar } from "./RightSideBar"

export const Layout = ( {children} ) => {
    return(
        <div className="w-full h-[100vh] flex items-center justify-between bg-[#080b11]">
            <LeftSidebar />
                {children}
            <RightSideBar />
        </div>
    )
}