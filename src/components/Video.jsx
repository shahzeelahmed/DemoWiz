export default function VideoView({url}){
    return (
        <div className="videomain">
        <div className="videodiv">
            <video className="video" src={url}></video>
        </div>
        </div>
    )
}
