-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 13, 2026 at 12:19 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `swivel_it`
--

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `course_name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `fee` decimal(10,2) DEFAULT NULL,
  `trainer_name` varchar(100) DEFAULT NULL,
  `trainer_email` varchar(150) DEFAULT NULL,
  `gmeet_link` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course_enquiries`
--

CREATE TABLE `course_enquiries` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `enquiry_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `payment_status` enum('unpaid','paid') DEFAULT 'unpaid',
  `enquired_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exam_applications`
--

CREATE TABLE `exam_applications` (
  `id` int(11) NOT NULL,
  `user_email` varchar(150) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `age` int(11) NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `phone` varchar(15) NOT NULL,
  `whatsapp` varchar(15) DEFAULT NULL,
  `college` varchar(200) DEFAULT NULL,
  `qualification` varchar(100) DEFAULT NULL,
  `passed_out_year` year(4) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `reference_name` varchar(150) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `course_name` varchar(150) DEFAULT NULL,
  `fees` decimal(10,2) DEFAULT NULL,
  `payment_status` enum('pending','paid') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_applications`
--

INSERT INTO `exam_applications` (`id`, `user_email`, `full_name`, `age`, `gender`, `phone`, `whatsapp`, `college`, `qualification`, `passed_out_year`, `district`, `pincode`, `reference_name`, `address`, `course_name`, `fees`, `payment_status`, `created_at`) VALUES
(1, 'santhiya1813@gmail.com', 'Santhiya M', 25, 'Female', '9080642054', '9080642054', 'Vels university', 'BE', '2022', 'Chennai', '600078', '', 'No.13 gandhi st , choolaipallam , M.G.R nagar chennai-78', 'NQT Exam', 1000.00, 'pending', '2026-03-13 05:47:33');

-- --------------------------------------------------------

--
-- Table structure for table `exam_attempts`
--

CREATE TABLE `exam_attempts` (
  `id` int(11) NOT NULL,
  `exam_attempt_id` int(11) NOT NULL,
  `user_email` varchar(150) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `nqt_id` varchar(50) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `total_questions` int(11) DEFAULT 0,
  `attempted_questions` int(11) DEFAULT 0,
  `correct_answers` int(11) DEFAULT 0,
  `score` int(11) DEFAULT 0,
  `exam_status` enum('IN_PROGRESS','COMPLETED') DEFAULT 'IN_PROGRESS',
  `started_at` datetime DEFAULT NULL,
  `ended_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_attempts`
--

INSERT INTO `exam_attempts` (`id`, `exam_attempt_id`, `user_email`, `full_name`, `nqt_id`, `role`, `total_questions`, `attempted_questions`, `correct_answers`, `score`, `exam_status`, `started_at`, `ended_at`, `created_at`) VALUES
(1, 3, 'santhiya1813@gmail.com', 'Santhiya M', NULL, 'CANDIDATE', 5, 5, 3, 3, 'COMPLETED', '2026-03-13 13:01:46', '2026-03-13 13:02:02', '2026-03-13 07:31:46');

-- --------------------------------------------------------

--
-- Table structure for table `exam_violations`
--

CREATE TABLE `exam_violations` (
  `id` int(11) NOT NULL,
  `exam_attempt_id` int(11) NOT NULL,
  `user_email` varchar(150) DEFAULT NULL,
  `full_name` varchar(150) DEFAULT NULL,
  `nqt_id` varchar(50) DEFAULT NULL,
  `violation_count` int(11) DEFAULT 1,
  `violation_types` text DEFAULT NULL,
  `last_violation_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_violations`
--

INSERT INTO `exam_violations` (`id`, `exam_attempt_id`, `user_email`, `full_name`, `nqt_id`, `violation_count`, `violation_types`, `last_violation_at`, `created_at`) VALUES
(1, 1, 'santhiya1813@gmail.com', 'Santhiya M', NULL, 1, 'Face not detected', '2026-03-13 13:02:00', '2026-03-13 07:32:00');

-- --------------------------------------------------------

--
-- Table structure for table `nqt_training_videos`
--

CREATE TABLE `nqt_training_videos` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `video_url` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nqt_training_videos`
--

INSERT INTO `nqt_training_videos` (`id`, `title`, `video_url`, `created_at`) VALUES
(1, 'Day 1', 'assets/videos/1773391827172_Swivel IT _ Login & Signup - Screencastify - February 18, 2026 10_36 AM.webm', '2026-03-13 08:50:27');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `dob` varchar(50) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','trainer') DEFAULT 'student',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `dob`, `mobile`, `password`, `role`, `status`, `created_at`) VALUES
(3, 'Santhiya', 'santhiya1813@gmail.com', '2026-03-11', '9080642054', '$2b$10$/T3s9k2o338UYfcKnJLp0e00deXmbMnZg1Yg/hwJJuaOdvc475O4m', 'trainer', 'active', '2026-03-13 05:34:01');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `course_enquiries`
--
ALTER TABLE `course_enquiries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `exam_applications`
--
ALTER TABLE `exam_applications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `exam_attempts`
--
ALTER TABLE `exam_attempts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `exam_violations`
--
ALTER TABLE `exam_violations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `exam_attempt_id` (`exam_attempt_id`);

--
-- Indexes for table `nqt_training_videos`
--
ALTER TABLE `nqt_training_videos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `mobile` (`mobile`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_enquiries`
--
ALTER TABLE `course_enquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exam_applications`
--
ALTER TABLE `exam_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `exam_attempts`
--
ALTER TABLE `exam_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `exam_violations`
--
ALTER TABLE `exam_violations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `nqt_training_videos`
--
ALTER TABLE `nqt_training_videos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `course_enquiries`
--
ALTER TABLE `course_enquiries`
  ADD CONSTRAINT `course_enquiries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_enquiries_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exam_violations`
--
ALTER TABLE `exam_violations`
  ADD CONSTRAINT `exam_violations_ibfk_1` FOREIGN KEY (`exam_attempt_id`) REFERENCES `exam_attempts` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
