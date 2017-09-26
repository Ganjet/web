function checkPalindrome(str) {
    var newStr = '', i;
    var oldStr ='';
    for (i = str.length - 1; i >= 0; i--) {
        newStr +=str.charAt(i);
    }
    for (i=0;i<=str.length;i++) {
        oldStr += str.charAt(i);
    }
    if (oldStr==newStr) {
       return true;
    }
    else {
       return false;
    }
}
