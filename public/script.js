(function () {
    var canvas = $("#signatureCanvas");
    var ctx = document.getElementById("signatureCanvas").getContext("2d");
    var dataUrl = $("#hiddenFieldId");

    var drawing;

    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    canvas.on("mousedown", (e) => {
        drawing = true;

        ctx.beginPath();
        ctx.moveTo(
            e.pageX - canvas.offset().left,
            e.pageY - canvas.offset().top
        );
    });

    canvas.on("mousemove", (e) => {
        if (drawing == true) {
            ctx.lineTo(
                e.pageX - canvas.offset().left,
                e.pageY - canvas.offset().top
            );
            ctx.stroke();
            dataUrl.val(canvas.get(0).toDataURL("image/png", 1.0));
            console.log(dataUrl.val());
        }
    });

    canvas.on("mouseup", () => {
        drawing = false;
    });

    canvas.on("mouseleave", () => {
        drawing = false;
    });
})();
