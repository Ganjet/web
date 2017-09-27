function array(data) {
    var sum=0;
    data.forEach(function(x){
        sum+=x;
    });
    console.log(sum);
}
var data = [1,5,4];
console.log(array(data));