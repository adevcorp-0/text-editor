import { useDispatch } from "react-redux";
import { setDefaultText } from "../../features/editor/editorSlice";

export const TypoStyles = ( {imgSrc} ) => {
    const dispatch = useDispatch();

    const handleClick = () => {
        dispatch(setDefaultText(imgSrc.text));
    };

    return(
        <img className="w-[90px] duration-75 mr-2 hover:border h-[90px] rounded-md cursor-pointer" src={imgSrc.src} alt="typo-style-image" onClick={handleClick}></img>
    )
}