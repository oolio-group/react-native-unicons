#import "Unicons.h"
#import <CoreText/CoreText.h>

@implementation Unicons

RCT_EXPORT_MODULE()

+ (void)load
{
    NSURL *fontURL = [[NSBundle bundleForClass:self] URLForResource:@"unicons-line" withExtension:@"ttf"];
    if (!fontURL) {
        fontURL = [[NSBundle mainBundle] URLForResource:@"unicons-line" withExtension:@"ttf"];
    }
    if (fontURL) {
        CTFontManagerRegisterFontsForURL((__bridge CFURLRef)fontURL, kCTFontManagerScopeProcess, NULL);
    }
}

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

@end
