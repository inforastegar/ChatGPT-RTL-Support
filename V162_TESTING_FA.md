# نسخه 1.6.2 — آزمون مبتنی بر DOM واقعی

در ۲۰ اکتبر ۲۰۲۶ خروجی Chrome گزارش کرد: messages=0، turns=0، paragraphs=104، headings=19، mainMarked=0 و allMarked=21. نسخه 1.6.1 در غیاب wrapperهای مورد انتظار بدنه را پردازش نمی‌کرد.

## نصب و تست

1. نسخه کامل را از شاخه fix/rtl-dynamic-content-v161 دانلود کن.
2. در chrome://extensions فقط یک اکستنشن RTL را فعال بگذار؛ نسخه unpacked را Reload کن.
3. تب ChatGPT را Refresh کن. اسکریپت تب‌های باز بدون Refresh به‌روز نمی‌شود.
4. RTL را On کن؛ پاراگراف‌ها، عنوان‌ها، پاسخ تازه، کد و متن انگلیسی را آزمایش کن.

## نتیجه مورد انتظار

در Console تب ChatGPT به ترتیب این عبارت‌ها را اجرا کن:

```javascript
document.documentElement.getAttribute('data-chatgpt-rtl-active')
document.querySelectorAll('main p,main h1,main h2,main h3,main h4,main h5,main h6').length
document.querySelectorAll('main [data-chatgpt-rtl-dir="rtl"]').length
getComputedStyle(document.querySelector('main [data-chatgpt-rtl-dir="rtl"]')).textAlign
```

در حالت On باید true به‌صورت رشته، شمارنده‌های مثبت و right ببینی. در Off شمارنده سوم صفر می‌شود.

اگر یک پاراگراف مشکل داشت، در Elements آن را انتخاب و در Console بررسی کن:

```javascript
getComputedStyle($0.closest('p') || $0).textAlign
```

هیچ نیازی به ارسال متن گفتگو یا HTML خام نیست.

## محدوده

Fallback بلوک‌های متنی داخل main را پردازش می‌کند و هدر، فرم، منو، عناصر تعاملی، pre/code و فرمول‌های ریاضی را مستثنی می‌کند. این اصلاح در Chromium شبیه‌سازی‌شده آزموده شده و هنوز نیاز به تأیید روی ChatGPT زنده دارد.