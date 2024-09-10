import React from "react"
import './../css/dashboard.css'


export const RoundTable = ({key, myref, cssclass, type, tableNumber}) => {

    return(
      <>
      {type === 'round' &&
        <div ref={(el) => myref(el)} key={key} className={`table round-table ${cssclass}`}>
          <div className="round-sub-circle">
            <span className="table-number">{tableNumber}</span>
            <div className="seat seat-top"></div>
            <div className="seat seat-bottom"></div>
            <div className="seat seat-left"></div>
            <div className="seat seat-right"></div>
          </div>
      </div>}

      {type === 'rectangle' &&
        <div ref={(el) => myref(el)} key={key} className={`table rectangle-table ${cssclass}`}>
          <div className="rect-sub-circle">
            <span className="table-number">{tableNumber}</span>
            <div className="seat seat-top"></div>
            <div className="seat seat-bottom"></div>
            <div className="seat seat-left"></div>
            <div className="seat seat-right"></div>
          </div>
      </div>}
      </>
    )
}

export const RectangleTable = ({key, myref, cssclass}) => {
  return(
    <>{type === 'rectangle' &&
      <div ref={(el) => myref(el)} key={key} className={`table rectangle-table ${cssclass}`}>
        <div className="sub-circle">
          <span className="table-number">02</span>
          <div className="seat seat-top"></div>
          <div className="seat seat-bottom"></div>
          <div className="seat seat-left"></div>
          <div className="seat seat-right"></div>
        </div>
    </div>
}
    </>
  )
}