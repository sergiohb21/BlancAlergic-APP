interface CardVideoProps {
  imgPath: string;
  titleText: string;
  infoText: string;
  buttonAction: () => void;
  buttonText: string;
}

function CardVideo({
  imgPath,
  titleText,
  infoText,
  buttonAction,
  buttonText,
}: CardVideoProps): JSX.Element {
  return (
    <article className="no-padding border round shadow">
      <img className="responsive small top-round" src={imgPath} alt={titleText} />
      <div className="padding">
        <h5>{titleText}</h5>
        <p>{infoText}</p>
        <button className="purple white-text" onClick={buttonAction}>
          {buttonText}
        </button>
      </div>
    </article>
  );
}

export default CardVideo;
