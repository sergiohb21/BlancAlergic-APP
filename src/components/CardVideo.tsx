interface CardVideoProps {
  videoPath: string;
  titleText: string;
  infoText: string;
  buttonAction: () => void;
  buttonText: string;
}
function CardVideo({
  videoPath,
  titleText,
  infoText,
  buttonAction,
  buttonText,
}: CardVideoProps): JSX.Element {
  return (
    <>
      <article className="no-padding border fill">
        <video className="responsive small">
          <source src={videoPath} type="video/mp4" />
        </video>
        <div className="padding">
          <h5>{titleText}</h5>
          <p>{infoText}</p>
          <nav>
            <button onClick={buttonAction}>{buttonText}</button>
          </nav>
        </div>
      </article>
    </>
  );
}

export default CardVideo;
