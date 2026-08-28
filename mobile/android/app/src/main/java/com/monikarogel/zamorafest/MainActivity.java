package com.monikarogel.zamorafest;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsetsController;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final int ZAMORAFEST_SYSTEM_BAR_COLOR =
        Color.rgb(6, 23, 20);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        scheduleSystemBarUpdate();
    }

    @Override
    public void onResume() {
        super.onResume();
        scheduleSystemBarUpdate();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);

        if (hasFocus) {
            scheduleSystemBarUpdate();
        }
    }

    private void scheduleSystemBarUpdate() {
        getWindow()
            .getDecorView()
            .post(this::applyZamoraFestSystemBars);
    }

    @SuppressWarnings("deprecation")
    private void applyZamoraFestSystemBars() {
        Window window = getWindow();

        window.addFlags(
            WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS
        );

        window.setStatusBarColor(
            ZAMORAFEST_SYSTEM_BAR_COLOR
        );

        window.setNavigationBarColor(
            ZAMORAFEST_SYSTEM_BAR_COLOR
        );

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            window.setNavigationBarDividerColor(
                ZAMORAFEST_SYSTEM_BAR_COLOR
            );
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.setNavigationBarContrastEnforced(false);
            window.setStatusBarContrastEnforced(false);
        }

        /*
         * Android 11+.
         * Eliminar APPEARANCE_LIGHT_* solicita iconos claros.
         */
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsController controller =
                window.getInsetsController();

            if (controller != null) {
                int lightAppearance =
                    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                    |
                    WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;

                controller.setSystemBarsAppearance(
                    0,
                    lightAppearance
                );
            }
        }

        /*
         * Aplicamos también las flags legacy.
         * Samsung One UI puede reintroducirlas durante
         * el ciclo de vida de la ventana.
         */
        View decorView = window.getDecorView();

        int flags = decorView.getSystemUiVisibility();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags &=
                ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            flags &=
                ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        }

        decorView.setSystemUiVisibility(flags);
    }
}