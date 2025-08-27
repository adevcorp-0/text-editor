import { TypoStyles } from "../typo-styles/TypoStyles";

export const TypoCard = () => {
    const styles = [
        {src : "/assets/img/typo1.png", text : "BourBON 10"},
        {src : "/assets/img/typo2.png", text : "Black Smith"},
        {src : "/assets/img/typo3.png", text : "Quality Branded GOODS"},
        {src : "/assets/img/typo4.png", text : "Hello Barcelona!"}
    ]
    return (
        <div className="w-full max-w-[300px] h-[100px] bg-[#373C48] flex items-center rounded-md overflow-hidden">
            {
                styles.map((style, key) => (
                    <TypoStyles imgSrc={style} key={key} />
                ))
            }
        </div>
    )
}   