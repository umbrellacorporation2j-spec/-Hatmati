# إعداد Firebase لتسجيل الحساب

المشكلة كانت ناتجة عن أن `createUserWithEmailAndPassword` ينشئ الحساب في Firebase Authentication أولًا، ثم قد تفشل كتابة ملف المستخدم في Firestore بسبب إعدادات الخدمة أو القواعد. عندها يبدو للمستخدم أن التسجيل فشل، بينما يبقى رقم التعريف محجوزًا في Authentication.

## المطلوب في Firebase Console

من **Authentication → Sign-in method** فعّل مزود **Email/Password**. لا يحتاج المستخدم إلى بريد حقيقي؛ التطبيق يحوّل رقم التعريف إلى عنوان داخلي بصيغة `id@khadamati.app`.

من **Authentication → Settings → Authorized domains** أضف نطاق التطبيق المنشور، وأضف نطاق المعاينة إذا كان مختلفًا. لا تحذف `localhost` إن كنت تختبر محليًا.

من **Firestore Database → Rules** تأكد أن القواعد تسمح للمستخدم المسجل بإنشاء وقراءة ملفه في `users/{uid}`، وبإنشاء وقراءة سجل اسم المستخدم في `usernames/{username}`. لا تضع قواعد مفتوحة مثل `allow read, write: if true` في الإنتاج.

قالب مبدئي للجزء الخاص بملف المستخدم واسم التعريف، يُدمج مع قواعد المنازل الحالية ولا يستبدلها عشوائيًا:

```text
match /users/{uid} {
  allow read, create, update: if request.auth != null && request.auth.uid == uid;
}

match /usernames/{username} {
  allow read: if request.auth != null;
  allow create: if request.auth != null
                && request.resource.data.uid == request.auth.uid;
  allow update, delete: if request.auth != null
                        && resource.data.uid == request.auth.uid;
}
```

بعد نشر القواعد، جرّب إنشاء حساب جديد. الحسابات التي حُجزت سابقًا بسبب المحاولة القديمة يمكن استكمالها من خيار **دخول** باستخدام كلمة المرور التي أُدخلت وقت التسجيل. إذا لم تكن كلمة المرور معروفة، احذف الحساب العالق من **Authentication → Users** ثم أعد التسجيل برقم تعريف جديد.

النسخة الجديدة من التطبيق لا تعتبر فشل Firestore فشلًا في إنشاء الحساب، وتُبقي المستخدم داخل التطبيق مع تنبيه واضح حتى تُصلح القواعد أو يعود الاتصال.

## قاعدة الأسعار العامة المشتركة المشتركة

أصبح ملف `firestore.rules` المرفق ملفًا كاملًا جاهزًا للنسخ. انسخه كاملًا إلى Firebase Console في **Firestore Database → Rules** ثم اضغط **Publish**. يشمل الملف قواعد المستخدمين والمنازل وطلبات الانضمام والأسعار العامة المشتركة، ويمنع التعديل أو الحذف العشوائي. إذا كان لديك مجموعات إضافية غير المستخدمة في تطبيق خدماتي، احتفظ بقواعدها وأضفها قبل النشر.

مصدر البحث الخارجي هو Open Food Facts للقراءة فقط. التطبيق لا يرسل أي كتابة إلى Open Food Facts، ولا يضع سعرًا من Open Food Facts لأن الخدمة لا توفر سعر متجر سعودي موثوقًا. البحث مؤجل 550ms ولا يعمل مع كل حرف مباشرة لتقليل الطلبات، ويتعامل مع timeout وفشل الشبكة والنتائج الفارغة.
