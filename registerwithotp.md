MODIFICATIONS PROPOSED FOR THE OTP IMPLEMENTATION-

models.py

class Teacher(models.Model):
    full_name=models.CharField(max_length=100)
    email=models.CharField(max_length=100)
    password=models.CharField(max_length=100, blank=True, null=True)
    qualification=models.CharField(max_length=200)
    mobile_no=models.CharField(max_length=20)
    profile_img=models.ImageField(upload_to='teacher_profile_imgs/', null=True)
    skills=models.TextField()
    verify_status=models.BooleanField(default=False)
    otp_digit=models.CharField(max_length=10, null=True)

    class Student(models.Model):
    full_name=models.CharField(max_length=100)
    email=models.CharField(max_length=100, unique=True)
    password=models.CharField(max_length=100, blank=True, null=True)
    username=models.CharField(max_length=200)
    interested_categories=models.TextField()
    profile_img=models.ImageField(upload_to='student_profile_imgs', null=True)
    verify_status=models.BooleanField(default=False)
    otp_digit=models.CharField(max_length=10, null=True)

    def __str__(self):
        return self.full_name

def save(self):
    if self.pk is None:
        send_mail(
            'Verify Account',
            'Please verify your account',
            'knoologylms@gmail.com',
            [self.email],
            fail_silently=False,
            html_message=f'<p>Your OTP is </p><p>{self.otp_digit}</p>'
        )
    return super().save()



views.py

@csrf_exempt
def teacher_Login(request):
    email=request.POST['email']
    password=request.POST['password']
    try:
        teacherData=models.Teacher.objects.get(email=email,password=password)
    except models.Teacher.DoesNotExist:
        teacherData=None
    if teacherData:
        if not teacherData.verify_status:
            return JsonResponse({'bool':False,'msg':'Account is not verified!!'})
        else:
            return JsonResponse({'bool':True,'teacher_id':teacherData.id})
    else:
        return JsonResponse({'bool':False,'msg':'Invalid Email Or Password!!!!'})


TeacherLogin.js

const submitForm = () => {
    const teacherFormData = new FormData();
    teacherFormData.append('email', teacherLoginData.email);
    teacherFormData.append('password', teacherLoginData.password);
    try {
        axios.post(baseUrl + '/teacher-login', teacherFormData)
            .then((res) => {
                if (res.data.bool === true) {
                    localStorage.setItem('teacherLoginStatus', true);
                    localStorage.setItem('teacherId', res.data.teacher_id);
                    window.location.href = '/teacher-dashboard';
                } else {
                    seterrorMsg(res.data.msg);
                }
            });
    } catch (error) {
        console.log(error);
    }
};




VerifyTeacherOtp.js (New Page)

import {useEffect, useState} from 'react';
import axios from 'axios';
const baseUrl='http://127.0.0.1:8000/api';

function VerifyTeacher() {
    const [teacherData, setteacherData]=useState({
        otp_digit:''
    });

    const [errorMsg, seterrorMsg]=useState('');

    const handleChange=(event) => {
        setteacherData({
            ...teacherData,
            [event.target.name]:event.target.value
        });
    };

    const submitForm=() => {
        const teacherFormData=new FormData();
        try {
            axios.post(baseUrl+'/verify-teacher', teacherFormData)
            .then((res) => {
                if(res.data.bool===true) {
                    localStorage.setItem('teacherLoginStatus', true);
                    localStorage.setItem('teacherId', res.data.teacher_id);
                    window.location.href='/teacher-dashboard';
                } else {
                    seterrorMsg(res.data.msg);
                }
            });
        } catch(error) {
            console.log(error);
        }
    };
}

const teacherLoginStatus=localStorage.getItem('teacherLoginStatus');
if(teacherLoginStatus==='true'){
    window.location.href='/teacher-dashboard';
}

useEffect(()=>{
    document.title='Verify Teacher';
});

return(
    <div className="container mt-4">
        <div className="row">
            <div className="col-6 offset-3">
                <div className="card">
                    <h5 className="card-header">Enter 6 Digit OTP</h5>
                    <div className="card-body">
                        <errorMsg className="text-danger">{errorMsg}</errorMsg>
                        <div className="mb-3">
                            <label for="exampleInputEmail1" className="form-label">OTP</label>
                            <input type="number" value={teacherData.otp_digit} name="otp_digit" onChange={handleChange} className="form-control" />
                        </div>
                        <button type="submit" onClick={submitForm} className="btn btn-primary">Verify</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);


TeacheRegister.js
try{
    axios.post(baseUrl, teacherFormData).then((response)=>{
        window.location.href='/verify-teacher/'+response.id;
         })
}catch(error){
    console.log(error);
    setteacherData({'status':'error'})
}
// End

useEffect(()=>{
    document.title="Teacher Register"
});



Main.js

<Route path="/verify-teacher/:teacher_id" element="VerifyTeacherOtp"> </Route>