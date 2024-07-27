// import { useReactMediaRecorder } from "react-media-recorder";
// export default function RecordView(){
//     const { status, startRecording, stopRecording, mediaBlobUrl } =
//     useReactMediaRecorder({ video: true });

//     return(
//         <>
        
//         </>
//     )
// }
import { useReactMediaRecorder } from "react-media-recorder";
import { useState,useEffect } from "react";

export default function RecordView(props) {
    const [second, setSecond] = useState("00");
    const [minute, setMinute] = useState("00");
    const [isActive, setIsActive] = useState(false);
    const [counter, setCounter] = useState(0);
    useEffect(() => {
      let intervalId;
  
      if (isActive) {
        intervalId = setInterval(() => {
          const secondCounter = counter % 60;
          const minuteCounter = Math.floor(counter / 60);
  
          let computedSecond =
            String(secondCounter).length === 1
              ? `0${secondCounter}`
              : secondCounter;
          let computedMinute =
            String(minuteCounter).length === 1
              ? `0${minuteCounter}`
              : minuteCounter;
  
          setSecond(computedSecond);
          setMinute(computedMinute);
  
          setCounter((counter) => counter + 1);
        }, 1000);
      }
  
      return () => clearInterval(intervalId);
    }, [isActive, counter]);
    function addHiddenCursorClass() {
      document.body.classList.add('hidden-cursor');
  }
  

    function stopTimer() {
      setIsActive(false);
      setCounter(0);
      setSecond("00");
      setMinute("00");
    }
    const {
      status,
      startRecording,
      stopRecording,
      pauseRecording,
      mediaBlobUrl
    } = useReactMediaRecorder({
      video: false,
      screen: true,
      audio: false,
      echoCancellation: true
    });
    console.log("url", mediaBlobUrl);
  
    return (
      <div className="recordDiv">
        <div
        
        >
          <h4
            style={{
              marginLeft: "10px",
              textTransform: "capitalize",
              fontFamily: "sans-serif",
              fontSize: "18px",
              color: "white"
            }}
          >
            {status}
          </h4>
        </div>
        <div style={{ height: "38px" }}>
          {" "}
          <video src={mediaBlobUrl} controls loop 
          style={{height: "400px",width:"400px"}}
          />
        </div>
  
        <div
          className="col-md-6 col-md-offset-3"
          style={{
            backgroundColor: "black",
            color: "white",
            marginLeft: "357px"
          }}
        >
          <button
            style={{
              backgroundColor: "black",
              borderRadius: "8px",
              color: "white"
            }}
            onClick={stopTimer}
          >
            Clear
          </button>
          <div style={{ marginLeft: "70px", fontSize: "54px" }}>
            <span className="minute">{minute}</span>
            <span>:</span>
            <span className="second">{second}</span>
          </div>
  
          <div style={{ marginLeft: "20px", display: "flex" }}>
            <label
              style={{
                fontSize: "15px",
                fontWeight: "Normal"
                
              }}
              htmlFor="icon-button-file"
            >
              <h3 style={{ marginLeft: "15px", fontWeight: "normal" }}>
                Press the Start to record
              </h3>
  
              <div>
                <button
                  style={{
                    padding: "0.8rem 2rem",
                    border: "none",
                    marginLeft: "15px",
                    fontSize: "1rem",
                    cursor: "pointer",
                    borderRadius: "5px",
                    fontWeight: "bold",
                    backgroundColor: "#42b72a",
                    color: "white",
                    transition: "all 300ms ease-in-out",
                    transform: "translateY(0)"
                  }}
                  onClick={() => {
                    if (!isActive) {
                      startRecording();
                      
                    } else {
                      pauseRecording();
                    }
  
                    setIsActive(!isActive);
                  }}
                >
                  {isActive ? "Pause" : "Start"}
                </button>
                <button
                  style={{
                    padding: "0.8rem 2rem",
                    border: "none",
                    backgroundColor: "#df3636",
                    marginLeft: "15px",
                    fontSize: "1rem",
                    cursor: "pointer",
                    color: "white",
                    borderRadius: "5px",
                    fontWeight: "bold",
                    transition: "all 300ms ease-in-out",
                    transform: "translateY(0)"
                  }}
                  onClick={() => {
                    stopRecording();
                    pauseRecording();
                  }}
                >
                  Stop
                </button>
              </div>
            </label>
          </div>
          <b></b>
        </div>
      </div>
    );
  };