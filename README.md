## Maintained fork: v1.6.3 (Chrome-tested)

This is a maintained fork of [ChatGPT RTL Support](https://github.com/inforastegar/ChatGPT-RTL-Support). This fork fixes the popup switch, RTL rendering of newly generated ChatGPT text/headings, and periodic synchronization without reopening the popup.

**Installation:** clone this repository; open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select the folder containing `manifest.json`. Disable other RTL extensions and reload open ChatGPT tabs after updating.

**Verification:** the owner reported all observed issues resolved in Chrome on 2026-10-20. Automated Chromium tests use synthetic DOM fixtures, not a live ChatGPT account; future UI updates can require maintenance.

**Docs:** [راهنمای فارسی نگهداری، نصب و تست](docs/MAINTENANCE_FA.md) · [CI workflow](.github/workflows/rtl-regression.yml) · [DOM diagnostics](diagnostics/README_FA.md).

**Permissions:** Chrome `storage`, `scripting`, and `tabs`, plus host permissions for ChatGPT domains, are needed for stored preferences and page updates. RTL processing is local; review the Persian guide for technical/privacy scope.

---
ChatGPT RTL Support extension
==============================

![screencapture-chat-openai-c-0c23ff21-a969-4fb3-9d13-92d17f681ee9-2023-12-08-12_19_44](https://github.com/rastegardev/css-layout-hack-extension/assets/85369490/2618ce4a-1b66-469a-8306-54dfebc7b552)

## 🪲 | Change Log
V1.4.5: Vazirmatn font has been added to openai.com

## 🗂️ | Description
EN:
"Right-to-Left Language Support in ChatGPT" is a powerful extension for the Chrome browser that enhances the experience of using ChatGPT by supporting right-to-left languages like Arabic and Persian.

Have you ever wanted to communicate in your native right-to-left language using ChatGPT, only to realize that the text direction and layout aren’t displayed correctly? With the right-to-left language support in ChatGPT, eliminate this limitation and have a seamless conversation experience.

Key features:

Right-to-Left Text Formatting: This extension applies right-to-left text direction in ChatGPT, ensuring that right-to-left languages are displayed correctly and legibly.

Improved Readability: By correcting text layout, right-to-left language support in ChatGPT allows you to easily and comprehensively engage in conversations, enhancing the flow of communication.

List Formatting: This extension also adjusts list items to provide appropriate formatting and layout for right-to-left languages, enhancing the overall readability of chat-based content.

With right-to-left language support in ChatGPT, you can easily express yourself and effectively communicate in right-to-left languages within the ChatGPT environment. This extension ensures that your text in right-to-left languages like Persian, Arabic, or any other language appears accurately and optimally formatted for communication

FA:
"پشتیبانی از زبان‌های راست به چپ در چت جی پی تی" یک افزونه قدرتمند برای مرورگر Chrome است که تجربه استفاده از چت جی پی تی را با پشتیبانی از زبان‌های راست به چپ مانند عربی و فارسی بهبود می‌بخشد.

آیا تا به حال می‌خواستید با چت جی پی تی به زبان راست به چپ مادری خود ارتباط برقرار کنید، اما متوجه شدید که جهت و چینش متن به درستی نمایش داده نمی‌شود؟ با پشتیبانی از زبان‌های راست به چپ در چت جی پی تی، این محدودیت را از بین ببرید و تجربه‌ای بی‌نقص از گفتگو داشته باشید.

ویژگی‌های کلیدی:

فرمت‌بندی متن راست به چپ: این افزونه جهت متن را به شکل راست به چپ در چت جی پی تی اعمال می‌کند تا متن به زبان‌های راست به چپ به درستی و به شکلی خوانا نمایش داده شود.

خوانایی بهتر: با صحیح‌کردن چینش متن، پشتیبانی از زبان‌های راست به چپ در چت جی پی تی به شما این امکان را می‌دهد که به راحتی و با فهم به گفتگوی دیگران بپردازید و جریان ارتباطی را بهبود بخشید.

فرمت‌بندی لیست: این افزونه همچنین موارد لیست را تنظیم می‌کند تا فرمت‌بندی و چینش مناسبی برای زبان‌های راست به چپ فراهم کند و خوانایی کلی محتوای مبتنی بر چت را بهبود بخشد.

با پشتیبانی از زبان‌های راست به چپ در چت جی پی تی، شما می‌توانید به راحتی خودتان را بیان کرده و به صورت موثر در محیط چت جی پی تی به زبان‌های راست به چپ ارتباط برقرار کنید. این افزونه تضمین می‌کند که متن شما به زبان‌های راست به چپ مانند فارسی، عربی یا هر زبان دیگری به صورت دقیق و با چینش بهینه برای ارتباط به نمایش درآید.

AR:
الدعم للغات اليمين إلى اليسار في ChatGPT" هو امتداد قوي لمتصفح Chrome يعزز تجربة استخدام ChatGPT من خلال دعم اللغات اليمين إلى اليسار مثل العربية والفارسية.

هل سبق لك أن أردت التواصل بلغتك الأصلية من اليمين إلى اليسار باستخدام ChatGPT، لتكتشف أن اتجاه النص والتنسيق لا يعرضان بشكل صحيح؟ مع دعم اللغات من اليمين إلى اليسار في ChatGPT، احذف هذا القيد واستمتع بتجربة محادثة سلسة.

المميزات الرئيسية:

تنسيق النص من اليمين إلى اليسار: يطبق هذا الامتداد اتجاه النص من اليمين إلى اليسار في ChatGPT، مضمناً عرض اللغات من اليمين إلى اليسار بشكل صحيح وواضح.

زيادة قراءة النص: من خلال تصحيح تنسيق النص، يسمح دعم اللغات من اليمين إلى اليسار في ChatGPT لك بالمشاركة بسهولة وشمولية في المحادثات، مما يعزز تدفق الاتصال.

تنسيق القوائم: يقوم هذا الامتداد أيضًا بضبط عناصر القوائم لتوفير تنسيق وتخطيط مناسب للغات من اليمين إلى اليسار، مما يعزز قراءة محتوى المحادثات بشكل عام.

مع دعم اللغات من اليمين إلى اليسار في ChatGPT، يمكنك التعبير بسهولة عن نفسك والتواصل بفعالية باللغات من اليمين إلى اليسار داخل بيئة ChatGPT. يضمن هذا الامتداد أن يظهر نصك باللغات من اليمين إلى اليسار مثل الفارسية، العربية، أو أي لغة أخرى بشكل دقيق ومنسق بشكل مثالي للتواصل.

## ✅ | Privacy Policy
Thank you for using the ChatGPT RTL Support Chrome extension. This Privacy Policy is intended to provide you with clear and transparent information about how we handle your data and protect your privacy while using our extension.
1. Data Collection and Usage
We want to assure you that ChatGPT RTL Support does not collect any personal or browsing data from our users. We are committed to prioritizing your privacy and ensuring a safe browsing experience. Our extension focuses solely on providing enhanced right-to-left (RTL) support for your chat experiences and does not require any data to be collected for its functioning.
2. Permissions
The extension uses Chrome storage, scripting and tabs permissions, plus host access for ChatGPT sites, to apply and persist RTL settings. The extension is designed to work seamlessly within the browser environment without accessing any personal information or browsing history.
3. Communication
Your feedback and questions are important to us. If you have any concerns, inquiries, or feedback about the extension’s privacy practices, please feel free to contact us at [your email address]. We are here to address any questions you may have and to ensure that you have a positive experience using our extension.
4. Updates
We may update ChatGPT RTL Support periodically to enhance its functionality or to address any issues that may arise. Any changes made to data collection or usage, if ever required in the future, will be reflected in this Privacy Policy. It’s recommended that you review this policy occasionally to stay informed about any updates.
5. Transparency
We believe in transparency and want you to know that ChatGPT RTL Support does not collect any user data. We aim to provide a reliable and trustworthy extension that enhances right-to-left (RTL) support for your chat experiences without compromising your privacy.
6. Resources
For additional information about Chrome Web Store’s developer guidelines and Google’s privacy policies, please refer to the following resources:
- Chrome Web Store Developer Guidelines
- Google Privacy Policy
7. Contact Us
If you have any questions, concerns, or feedback about this Privacy Policy or the ChatGPT RTL Support Chrome extension, please contact us at business.rezarastegar@gmail.com. Your privacy matters to us, and we are dedicated to addressing your inquiries promptly.
We appreciate your trust in using ChatGPT RTL Support and want to assure you that your privacy is our top priority. By using our extension, you agree to the practices outlined in this Privacy Policy.
Thank you for choosing ChatGPT RTL Support! ❤️

## ✅ | سیاست حفظ حریم خصوصی
از استفاده‌ی شما از افزونه کروم پشتیبانی از ChatGPT RTL استقبال می‌کنیم. این سیاست حفظ حریم خصوصی به منظور ارائه‌ی اطلاعات روشن و شفاف درباره چگونگی برخورد با داده‌های شما و حفاظت از حریم خصوصی‌تان در هنگام استفاده از افزونه ما طراحی شده است.
1. جمع‌آوری و استفاده از داده
می‌خواهیم به شما تضمین کنیم که پشتیبانی ChatGPT RTL هیچ گونه داده شخصی یا مرور کاربران را جمع‌آوری نمی‌کند. ما متعهد به اولویت دادن به حریم خصوصی شما و اطمینان از یک تجربه‌ی مرور امن هستیم. افزونه ما صرفاً بر روی بهبود پشتیبانی از حالت راست به چپ (RTL) در گفتگوها تمرکز دارد و برای عملکردش نیازی به جمع‌آوری داده ندارد.
2. مجوزها
این افزونه برای اعمال و حفظ تنظیمات RTL از مجوزهای storage، scripting و tabs و دسترسی به دامنه‌های ChatGPT استفاده می‌کند. این افزونه طراحی شده است تا بدون دسترسی به هیچگونه اطلاعات شخصی یا تاریخچه مرور کاربران در محیط مرورگر کار کند.
3. ارتباط
نظرات و سوالات شما برای ما مهم است. اگر هرگونه نگرانی، پرسش یا بازخوردی درباره سیاست‌های حفظ حریم خصوصی افزونه دارید، لطفاً به ما ایمیل بزنید. ما اینجا هستیم تا به هر سوالی که شما دارید پاسخ دهیم و اطمینان حاصل کنیم که تجربه‌ی مثبتی از استفاده از افزونه ما داشته باشید.
4. به‌روزرسانی‌ها
ممکن است ChatGPT RTL را به‌صورت دوره‌ای به‌روزرسانی کنیم تا عملکرد آن را بهبود بخشیم یا به هر مسئله‌ای که ممکن است پیش بیاید پاسخ دهیم. هر تغییری که در جمع‌آوری یا استفاده از داده‌ها، در صورت نیاز در آینده، اعمال شود، در این سیاست حفظ حریم خصوصی بازتاب داده خواهد شد. توصیه می‌شود که این سیاست را گاه‌فراموش مورد بررسی قرار دهید تا از هر به‌روزرسانی آگاه شوید.
5. شفافیت
ما به شفافیت اعتقاد داریم و می‌خواهیم بدانید که پشتیبانی ChatGPT RTL هیچگونه داده کاربر را جمع‌آوری نمی‌کند. هدف ما ارائه‌ی یک افزونه قابل اعتماد و قابل اطمینان است که پشتیبانی از حالت راست به چپ (RTL) در گفتگوها را بهبود می‌دهد بدون آسیب دیدن به حریم خصوصی شما.
6. منابع
برای اطلاعات بیشتر درباره رهنمودهای توسعه‌دهنده فروشگاه Chrome و سیاست‌های حفظ حریم خصوصی گوگل، لطفاً به منابع زیر مراجعه کنید:
- رهنمودهای توسعه‌دهنده فروشگاه Chrome
- سیاست حفظ حریم خصوصی گوگل
7. تماس با ما
اگر هرگونه سوال، نگرانی یا بازخوردی درباره این سیاست حفظ حریم خصوصی یا افزونه کروم ChatGPT RTL دارید، لطفاً با ما با آدرس ایمیل business.rezarastegar@gmail.com تماس بگیرید
