// const galleryData = new FormData()
// for (let i = 0; i < files.length; i++) {
//    galleryData.append('images[]', file[i])
// }

// When the value is a Blob
// formData.append("userpic", myFileInput.files[0], "chris1.jpg");
// formData.append("userpic", myFileInput.files[1], "chris2.jpg");

// fetch(img.src)
//     .then(res => res.blob())
//     .then(blob => {
//         const file = new File([blob], "capture.png", {
//             type: 'image/png'
//         });
//         var fd = new FormData();
//         fd.append("image", file);
//         $.ajax({
//             type: "POST",
//             enctype: 'multipart/form-data',
//             url: "/api/file/upload",
//             data: fd,
//             processData: false,
//             contentType: false,
//             cache: false,
//             success: (data) => {
//                 alert("yes");
//             },
//             error: function(xhr, status, error) {
//                 alert(xhr.responseText);
//             }
//         });
//     });