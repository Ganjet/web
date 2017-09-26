function adjacentElementsProduct(array) {

    var i; //array = [3, -1, -100, 5,100];
    var max = array[0]*array[1];
    for (i = 0; array.length > i; i++) {
        var sum = array[i] * array[i + 1];
        if (sum > max) {
            max = sum;
        }
    }
    return max;
}
