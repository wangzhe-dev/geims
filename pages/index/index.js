// pages/index/index.js
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName')
  },
  
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },
  
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  
  getUserProfile(e) {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  
  getUserInfo(e) {
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
