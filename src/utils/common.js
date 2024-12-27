
export function milliSecond2Second(time) {

    const integerPart = time / 1000; 
    const decimalPart = time % 1000; 
  
    return Number(integerPart) + Number(decimalPart) / 1000;
  }
  
  