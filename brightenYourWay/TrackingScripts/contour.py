import numpy as np
import cv2 as cv


def get_contours(im):
	imgray = cv.cvtColor(im, cv.COLOR_BGR2GRAY)
	imgray = cv.GaussianBlur(imgray,(5,5),0)
	ret, thresh = cv.threshold(imgray, 190, 255, 0)
	contours, hierarchy = cv.findContours(thresh, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE)
	result = []
	for cnt in contours:
		if cv.contourArea(cnt) > 1:
			result.append(cnt)
	return thresh, result


def get_first_center(im):
	origin_y = 90
	origin_x = 100
	hresh, result = get_contours(im)
	for cnt in contours:
		rect = cv.minAreaRect(cnt)
		cx = rect[0][0]
		cy = rect[0][1]
		# M = cv.moments(cnt)
		# cx = int(M['m10']/M['m00'])
		# cy = int(M['m01']/M['m00'])
class PersonFinder:
	def __init__(self):
		self.countSearch = 0
		self.searching = True
		self.searchSpace = 3
		self.lastCx = None
		self.lastCy = None
		self.lastResults = []
		self.cx = 85
		self.cy = 90
		self.idel = 0
		self.checkNoise = 0

	def __Get_Coordinates(self, cnt):
		rect = cv.minAreaRect(cnt)
		cx = rect[0][0]
		cy = rect[0][1]
		return(cx, cy)

	def get_new_cors(self, contours, direction):
		dist = float("inf")
		for cnt in contours:
			cx, cy = self.__Get_Coordinates(cnt)
			curr_dist = (cx-self.cx)**2 + (cy-self.cy)**2
			if curr_dist < dist and cx < 130 and cx > 40:
				dist = curr_dist
				result = cnt
				res_cx = cx
				res_cy = cy

		if dist < self.searchSpace:
			self.checkNoise += 1
			self.idel = 0
			self.searching = False
			self.countSearch = 0
			self.searchSpace = 3
			res_cx, res_cy = self.__Get_Coordinates(result)
			if self.checkNoise > 20:
				for x in range(1):
					cx, cy = self.__Get_Coordinates(self.lastResults[x])
					cx1, cy1 =  self.__Get_Coordinates(self.lastResults[x+15])
					curr_dist = (cx-cx1)**2 + (cy-cy1)**2
					if not (0.5 < curr_dist):
						res_cx = 85
						res_cy = 90
						self.lastResults.clear()
						print("hardreset")
						break
			# print("good")
		elif dist >= self.searchSpace and self.searching == False and self.countSearch < 10:
			self.idel = 0
			self.checkNoise = 0
			self.countSearch += 1
			self.searchSpace += 5
			res_cx = self.cx
			res_cy = self.cy
			result = self.lastResults[0]
			# print("bad but try to find")
		elif self.countSearch > 9:
			self.checkNoise = 0
			self.idel = 0
			self.searching = True
			self.lastResults.clear()
		elif self.searching == True and self.countSearch > 3:
			self.idel = 0
			self.checkNoise = 0
			# print("searching")
			if self.searchSpace < 39:
				self.searchSpace += 5
			for x in range(len(self.lastResults)-2):
				cx, cy = self.__Get_Coordinates(self.lastResults[x])
				cx1, cy1 =  self.__Get_Coordinates(self.lastResults[x+2])
				curr_dist = (cx-cx1)**2 + (cy-cy1)**2
				if not (10 < curr_dist < 40):
					res_cx = 85
					res_cy = 90
					self.lastResults.clear()
					break
			self.searching = False
			self.searchSpace = 3
			lostTrack = False
			countSearch = 0
			res_cx, res_cy = self.__Get_Coordinates(result)
		else:
			self.idel += 1


		if res_cx > self.cx and direction < 15:
			direction += 1
		elif res_cx < self.cy and direction > 5:
			direction -= 1
		#print(dist, res_cx, res_cy, lostTrack, self.searching, direction)
		if not (dist >= self.searchSpace and self.searching == False and self.countSearch < 10):
			self.lastResults.insert(0,result)
		if len(self.lastResults) > 50:
			del self.lastResults[-1]
		self.cx = res_cx
		self.cy = res_cy
		# print(dist, res_cx, res_cy, self.searching, self.idel, self.countSearch)
		if self.idel > 0 and len(self.lastResults) > (self.idel):
			return direction, self.lastResults[self.idel]
		return direction, result

# im = cv.imread('test.jpg')
# contours = get_contours(im)

# for cnt in contours:
# 	# M = cv.moments(cnt)
# 	# cx = int(M['m10']/M['m00'])
# 	# cy = int(M['m01']/M['m00'])
# 	# cv.circle(thresh, (cx,cy), 1, color=(0,255,255), thickness=2, lineType=8, shift=0)
# 	# print(cx,cy)
# 	# print(cv.contourArea(cnt))
# 	# cv.drawContours(thresh, [cnt], 0, (183,23,100), -1)
# for row in thresh:
# 	for i in range(len(row)):
# 		row[i] = 255

# cv.imshow('thresh', thresh)
# cv.waitKey(0)
