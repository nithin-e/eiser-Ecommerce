const { $where } = require("../../models/usermodel");

// user bolck and unblock
function block_unblock(id) {
  console.log(id, "ggygygy");
  // Show SweetAlert confirmation dialog
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, bolck it!",
  }).then((result) => {
    if (result.isConfirmed) {
      console.log("ajax working");
      $.ajax({
        url: "/blockuser/" + `${id}`,
        method: "patch",
        success: function (res) {
          Swal.fire({
            text: res.msg,
            icon: "success",
            timer: 3000,
            showConfirmButton: false,
          });
          console.log("loggggggg");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        },
        error: function (err) {
          Swal.fire({
            text: "Something went wrong",
            icon: "error",
            timer: 3000,
            showConfirmButton: false,
          });
          console.log(err);
        },
      });
    }
  });
}

// block and unblock category

function categoryBlock(id) {
  console.log(id ,"id kitteele");
 swal.fire({
  title: "Are you sure?",
  text: "You won't be able to revert this!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "Yes, bolck it!",
 }).then((result)=>{
  if(result.isConfirmed){
    console.log("ajax working");
  $.ajax({
  url:"/blockCategory/"+`${id}`,
  method:"patch",
  success:function (res) {
    
    swal.fire({
      text:res.msg,
      icon: "success",
      timer: 3000,
      showConfirmButton: false,
    })
     console.log("pakkaa settayi");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
},
  error:function (error) {
    swal.fire({
      text: "Something went wrong",
            icon: "error",
            timer: 3000,
            showConfirmButton: false,
    })
    console.log(error);
           }
        })
      }
   })
}



//block and unblock brand

function blockAndUnblock(id) {
  console.log("id here",id);
  swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, bolck it!",
  }).then((result)=>{
     if(result.isConfirmed){
      console.log("ajaj is working");
      $.ajax({
        url:"/blockbrand/"+`${id}`,
        method:"patch",
        success:function(res) {
          swal.fire({
            text:res.msg,
            icon: "success",
            timer: 3000,
            showConfirmButton: false,
          })
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        },
        error:function (err) {
          swal.fire({
            text: "Something went wrong",
                  icon: "error",
                  timer: 3000,
                  showConfirmButton: false,
          })
        }
      })
     }
  })
}



//edit product 