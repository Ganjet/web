function minElement(array) {

    var i;
    var min = array[0]*array[1];
    for (i = 0; array.length > i; i++) {
        var sum = array[i];
        if (sum < min) {
            min = sum;
        }
    }
    return min;
}

var array = [1, 0, -1, 0, 1000];
console.log(minElement(array));