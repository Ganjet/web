function adjacentElementsProduct(array) {

    var i;
    var max = array[0]*array[1];
    for (i = 0; array.length > i; i++) {
        var sum = array[i];
        if (sum > max) {
            max = sum;
        }
    }
    return max;
}

var array = [1, 0, 1, 0, 1000];
console.log(adjacentElementsProduct(array));
