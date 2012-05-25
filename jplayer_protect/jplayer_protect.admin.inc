<?php

/**
 * Page callback for the jPlayer protection statistics page. This page is
 * useful in determining if a browser is misbehaving and blocking legitimiate
 * file accesses, or if a user is trying to download a protected file.
 */
function jplayer_protection_statistics() {
  if (!variable_get('jplayer_protect', FALSE)) {
    drupal_set_message(t('<a href="@jplayer-settings">jPlayer content protection</a> is not currently enabled.', array('@jplayer-settings' => url('admin/settings/jplayer', array('query' => drupal_get_destination())))));
  }

  $output = '<p>' . t('This table shows the 50 top users who have been denied access to direct downloads of jPlayer files.') . '</p>';

  $result = db_query("SELECT COUNT(1) as total, uid as user, MAX(timestamp) as timestamp FROM {jplayer_protect_denied} GROUP BY uid ORDER BY total DESC, timestamp DESC LIMIT 50;");
  $rows = array();
  while ($denied = db_fetch_array($result)) {
    $denied = (array)$denied;
    // Format data from the query.
    $uid = $denied['user'];
    $denied['user'] = theme('username', user_load($denied['user']));
    $denied['timestamp'] = format_date($denied['timestamp']);

    // Find the top-denied file for the user.
    $top_file = db_fetch_object(db_query("SELECT COUNT(fid) as fid_count, fid FROM {jplayer_protect_denied} WHERE uid = %d GROUP BY fid ORDER BY fid_count DESC LIMIT 1", $uid));
    $top_file = db_fetch_object(db_query("SELECT * FROM {files} WHERE fid = %d", $top_file->fid));
    $denied['file'] = $top_file->filepath;

    // Find the top hostname for the user.
    $top_hostname = db_fetch_object(db_query("SELECT COUNT(hostname) as hostname_count, hostname FROM {jplayer_protect_denied} WHERE uid = %d GROUP BY hostname ORDER BY hostname_count DESC LIMIT 1", $uid));
    $denied['hostname'] = $top_hostname->hostname;

    $rows[] = $denied;
  }

  $header = array(
    t('Accesses denied'),
    t('User'),
    t('Last denied'),
    t('Top Denied File'),
    t('Top Hostname'),
  );

  if (!empty($rows)) {
    $output .= theme('table', $header, $rows);
  }
  else {
    $output .= '<p>' . t('There have been no files that have been denied access within the last week.') . '</p>';
  }
  return $output;
}

/**
 * Settings form for enabling jPlayer protection.
 */
function jplayer_protect_settings_form(&$form, &$form_state) {
  $form['jplayer_protect'] = array(
    '#title' => t('Protect audio files from direct downloads'),
    '#type' => 'checkbox',
    '#default_value' => variable_get('jplayer_protect', FALSE),
  );

  if (variable_get('file_downloads', FILE_DOWNLOADS_PUBLIC) == FILE_DOWNLOADS_PUBLIC) {
    $form['jplayer_protect']['#description'] = t('To enable file download protection, first <a href="@file-system-settings">set a Private file system path and set protected file fields to use it</a>.', array('@file-system-settings' => url('admin/settings/file-system', array('query' => drupal_get_destination()))));
  }

  $form['jplayer_protect_access_time'] = array(
    '#title' => t('Access delay'),
    '#type' => 'textfield',
    '#default_value' => variable_get('jplayer_protect_access_time', 30),
    '#size' => 5,
    '#description' => t('The number of seconds that a client will have access to download a protected file after it is requested by jPlayer.'),
  );

  $form['buttons']['#weight'] = 10;
  $form['#validate'][] = 'jplayer_protect_settings_form_validate';
}

/**
 * Validate the access time setting.
 */
function jplayer_protect_settings_form_validate($form, &$form_state) {
  $time = $form_state['values']['jplayer_protect_access_time'];
  if ($form_state['values']['jplayer_protect'] && !is_numeric($time)) {
    form_error($form['jplayer_protect_access_time'], t('Access time must be a value in seconds.'));
  }
  if (intval($time) < 0) {
    form_error($form['jplayer_protect_access_time'], t('Access time must be at least 0 seconds.'));
  }
}

